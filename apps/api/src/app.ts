import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { requestId } from './middleware/request-id.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware, workspaceRoleMiddleware } from './middleware/auth.js';
import { tenantMiddleware } from './middleware/tenant.js';
import { healthRoutes } from './routes/health.js';
import { workspaceRoutes } from './routes/workspaces.js';
import { projectRoutes } from './routes/projects.js';
import { workItemRoutes } from './routes/work-items.js';
import { sprintRoutes } from './routes/sprints.js';
import { commentRoutes } from './routes/comments.js';
import { activityRoutes } from './routes/activity.js';
import { automationRoutes } from './routes/automations.js';
import { aiRoutes } from './routes/ai.js';
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

// Health routes — no auth required
api.route('/health', healthRoutes);

// All other routes require authentication
api.use('/workspaces/*', authMiddleware());
api.use('/projects/*', authMiddleware(), tenantMiddleware(), workspaceRoleMiddleware());
api.use('/work-items/*', authMiddleware(), tenantMiddleware(), workspaceRoleMiddleware());
api.use('/sprints/*', authMiddleware(), tenantMiddleware());
api.use('/automations/*', authMiddleware(), tenantMiddleware());
api.use('/ai/*', authMiddleware(), tenantMiddleware());

api.route('/workspaces', workspaceRoutes);
api.route('/projects', projectRoutes);
api.route('/work-items', workItemRoutes);
api.route('/sprints', sprintRoutes);
api.route('/', commentRoutes);   // comment routes are nested under /work-items/:id/comments
api.route('/', activityRoutes);  // activity routes are nested under /work-items/:id/activity
api.route('/automations', automationRoutes);
api.route('/ai', aiRoutes);

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
