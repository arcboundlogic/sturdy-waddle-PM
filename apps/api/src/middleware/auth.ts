import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { db } from '@waddle/db';
import { workspaceMembers } from '@waddle/db';
import { eq, and } from 'drizzle-orm';
import type { MemberRole } from '@waddle/types';

interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

/** Decode a JWT without verification (for test/dev environments without jose) */
function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT format');
  const payload = parts[1];
  const decoded = Buffer.from(payload, 'base64url').toString('utf8');
  return JSON.parse(decoded) as JwtPayload;
}

/** Verify a HS256 JWT using the AUTH_SECRET env var */
async function verifyJwt(token: string): Promise<JwtPayload> {
  const secret = process.env['AUTH_SECRET'];
  if (!secret) {
    // In development without AUTH_SECRET, decode without verification
    return decodeJwt(token);
  }

  try {
    // Use jose if available, otherwise fall back to decode-only
    const { jwtVerify, createSecretKey } = await import('jose').catch(() => null) as
      | typeof import('jose')
      | null;
    if (jwtVerify && createSecretKey) {
      const key = createSecretKey(Buffer.from(secret));
      const { payload } = await jwtVerify(token, key);
      return payload as unknown as JwtPayload;
    }
  } catch {
    throw new HTTPException(401, { message: 'Invalid or expired token' });
  }
  return decodeJwt(token);
}

/**
 * JWT authentication middleware.
 * Validates the Authorization: Bearer header and sets userId/userEmail on context.
 */
export function authMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const authorization = c.req.header('Authorization');
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new HTTPException(401, { message: 'Authentication required' });
    }

    const token = authorization.slice(7);
    let payload: JwtPayload;
    try {
      payload = await verifyJwt(token);
    } catch {
      throw new HTTPException(401, { message: 'Invalid or expired token' });
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new HTTPException(401, { message: 'Token expired' });
    }

    c.set('userId', payload.sub);
    c.set('userEmail', payload.email);
    c.set('userName', payload.name);
    await next();
  };
}

/**
 * Resolve the caller's workspace role and attach it to context.
 * Must run after authMiddleware and tenantMiddleware.
 */
export function workspaceRoleMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const userId = c.get('userId') as string | undefined;
    const workspaceId = c.get('workspaceId') as string | undefined;

    if (userId && workspaceId) {
      try {
        const [membership] = await db
          .select({ role: workspaceMembers.role })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.userId, userId),
              eq(workspaceMembers.workspaceId, workspaceId),
            ),
          )
          .limit(1);
        if (membership) {
          c.set('userRole', membership.role as MemberRole);
        }
      } catch {
        // Non-fatal — route handlers do their own checks
      }
    }

    await next();
  };
}
