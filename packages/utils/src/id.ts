/**
 * Generate a cryptographically secure UUID v4.
 * Uses the Web Crypto API which is available in Node.js 19+ and modern browsers.
 */
export function generateId(): string {
  return crypto.randomUUID();
}
