import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { burndownRoutes } from './routes/reports.js';

const app = new Hono();

app.route('/analytics', burndownRoutes);

app.get('/', (c) => c.json({ service: 'analytics', version: '0.1.0' }));

const port = Number(process.env['ANALYTICS_PORT'] ?? 4004);
serve({ fetch: app.fetch, port });
console.log(`📊 Analytics service running on port ${port}`);
