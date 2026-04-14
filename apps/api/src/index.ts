import { serve } from '@hono/node-server';
import { app } from './app.js';

const port = Number(process.env['API_PORT']) || 4000;

console.log(`🐧 Sturdy Waddle PM API starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ API server running at http://localhost:${port}`);
