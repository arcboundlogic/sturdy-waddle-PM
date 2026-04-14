import type { MiddlewareHandler } from 'hono';
import { randomUUID } from 'crypto';

/**
 * Adds a unique request ID to every request for tracing.
 */
export function requestId(): MiddlewareHandler {
  return async (c, next) => {
    const id = c.req.header('X-Request-Id') ?? randomUUID();
    c.set('requestId', id);
    c.header('X-Request-Id', id);
    await next();
  };
}
