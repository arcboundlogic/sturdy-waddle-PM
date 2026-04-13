import { randomUUID } from 'crypto';

/**
 * Generate a cryptographically secure UUID v4.
 */
export function generateId(): string {
  return randomUUID();
}
