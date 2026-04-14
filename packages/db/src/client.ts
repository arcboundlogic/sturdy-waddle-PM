import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type Database = PostgresJsDatabase<typeof schema>;

/**
 * Create a new database client instance.
 * Use this for custom connections (e.g., tests, migrations).
 */
export function createDbClient(url: string): Database {
  const sql = postgres(url);
  return drizzle(sql, { schema });
}

/**
 * Default database client — uses DATABASE_URL from env.
 * Lazy-initialized on first access.
 */
let _db: Database | null = null;

export const db: Database = new Proxy({} as Database, {
  get(_target, prop) {
    if (!_db) {
      const url = process.env['DATABASE_URL'];
      if (!url) {
        throw new Error('DATABASE_URL environment variable is not set');
      }
      _db = createDbClient(url);
    }
    return (_db as unknown as Record<string | symbol, unknown>)[prop];
  },
});
