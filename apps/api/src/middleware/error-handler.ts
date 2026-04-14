import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

/**
 * Global error handler — returns structured JSON errors.
 */
export const errorHandler: ErrorHandler = (err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err instanceof HTTPException) {
    return c.json(
      {
        code: `HTTP_${err.status}`,
        message: err.message,
        requestId: c.get('requestId'),
      },
      err.status,
    );
  }

  return c.json(
    {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      requestId: c.get('requestId'),
    },
    500,
  );
};
