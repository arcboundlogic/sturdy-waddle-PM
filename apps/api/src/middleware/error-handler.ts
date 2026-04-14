import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Global error handler — returns structured JSON errors with { error: { code, message, details } }.
 */
export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err instanceof HTTPException) {
    const cause = err.cause as Record<string, unknown> | undefined;
    return c.json(
      {
        error: {
          code: `HTTP_${err.status}`,
          message: err.message,
          details: cause ?? undefined,
          requestId: c.get('requestId'),
        },
      },
      err.status,
    );
  }

  return c.json(
    {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        requestId: c.get('requestId'),
      },
    },
    500,
  );
};
