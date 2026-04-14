import { Hono } from 'hono';
import { APP_VERSION } from '../constants.js';

export const healthRoutes = new Hono();

/** Health check endpoint */
healthRoutes.get('/', (c) =>
  c.json({
    status: 'healthy',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    services: {
      api: 'up',
      database: 'not_connected', // TODO: implement actual check
      redis: 'not_connected', // TODO: implement actual check
    },
  }),
);

/** Readiness probe for Kubernetes */
healthRoutes.get('/ready', (c) =>
  c.json({
    ready: true,
    timestamp: new Date().toISOString(),
  }),
);

/** Liveness probe for Kubernetes */
healthRoutes.get('/live', (c) =>
  c.json({
    alive: true,
    uptime: process.uptime(),
  }),
);
