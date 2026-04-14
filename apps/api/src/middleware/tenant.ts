import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Tenant resolution middleware.
 * Resolves workspace context from subdomain or header.
 *
 * In production, this would look up the workspace from the DB.
 * For now, it reads the X-Workspace-Id header.
 */
export function tenantMiddleware(): MiddlewareHandler {
  return async (c, next) => {
    const workspaceId = c.req.header('X-Workspace-Id');

    if (!workspaceId) {
      throw new HTTPException(400, {
        message: 'X-Workspace-Id header is required',
      });
    }

    c.set('workspaceId', workspaceId);
    await next();
  };
}
