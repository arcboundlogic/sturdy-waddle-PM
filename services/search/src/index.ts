import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { searchRoutes } from './routes/search.js';

const app = new Hono();

app.route('/search', searchRoutes);

app.get('/', (c) => c.json({ service: 'search', version: '0.1.0' }));

const port = Number(process.env['SEARCH_PORT'] ?? 4005);
serve({ fetch: app.fetch, port });
console.log(`🔍 Search service running on port ${port}`);
