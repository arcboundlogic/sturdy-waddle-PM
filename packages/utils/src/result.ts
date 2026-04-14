/**
 * Result type for explicit error handling without exceptions.
 * Inspired by Rust's Result<T, E>.
 */
export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/** Create a success result */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

/** Create an error result */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
