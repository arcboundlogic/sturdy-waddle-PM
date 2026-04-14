import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { githubRoutes } from './routes/github.js';

const app = new Hono();

app.route('/integrations/github', githubRoutes);

app.get('/', (c) => c.json({ service: 'integrations', version: '0.1.0' }));

const port = Number(process.env['INTEGRATIONS_PORT'] ?? 4003);
serve({ fetch: app.fetch, port });
console.log(`🔗 Integrations service running on port ${port}`);
