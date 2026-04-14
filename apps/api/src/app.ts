import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from './middleware/request-id.js';
import { errorHandler } from './middleware/error-handler.js';
import { healthRoutes } from './routes/health.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { projectRoutes } from './routes/projects.js';
import { workItemRoutes } from './routes/work-items.js';
import { APP_VERSION } from './constants.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', cors());
app.use('*', requestId());

// Error handling
app.onError(errorHandler);

// API routes
const api = new Hono();

api.route('/health', healthRoutes);
api.route('/workspaces', workspaceRoutes);
api.route('/projects', projectRoutes);
api.route('/work-items', workItemRoutes);

// Mount API under versioned prefix
app.route('/api/v1', api);

// Root redirect
app.get('/', (c) =>
  c.json({
    name: 'Sturdy Waddle PM API',
    version: APP_VERSION,
    docs: '/api/v1/health',
  }),
);

export { app };
