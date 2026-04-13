import { z } from 'zod';

/**
 * Environment variable schema with validation.
 * All apps import and validate their env through this package.
 */
const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // Auth
  AUTH_SECRET: z.string().min(16).optional(),
  NEXTAUTH_URL: z.string().url().optional(),

  // AI
  OPENAI_API_KEY: z.string().optional(),

  // S3
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Ports
  API_PORT: z.coerce.number().default(4000),
  WEB_PORT: z.coerce.number().default(3000),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Parse and validate environment variables.
 * Throws on invalid configuration.
 */
export function parseEnv(env: Record<string, string | undefined> = process.env): Env {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const formatted = result.error.format();
    console.error('❌ Invalid environment variables:', JSON.stringify(formatted, null, 2));
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}

/** App-wide constants */
export const APP_NAME = 'Sturdy Waddle PM';
export const APP_VERSION = '0.1.0';
export const API_PREFIX = '/api/v1';

/** Default pagination limits */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
} as const;

/** Tenant tier limits */
export const TIER_LIMITS = {
  solo: { maxUsers: 1, maxProjects: 3, maxTasks: 500 },
  team: { maxUsers: 25, maxProjects: -1, maxTasks: -1 },
  organization: { maxUsers: 500, maxProjects: -1, maxTasks: -1 },
  enterprise: { maxUsers: -1, maxProjects: -1, maxTasks: -1 },
} as const;
