import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import Redis from 'ioredis';

const PORT = Number(process.env['REALTIME_PORT'] ?? 4001);
const REDIS_URL = process.env['REDIS_URL'] ?? 'redis://localhost:6379';
const CHANNEL = 'waddle:events';

interface Client {
  ws: WebSocket;
  workspaceId?: string;
}

const clients = new Set<Client>();

/** Broadcast an event to all connected clients in a workspace */
function broadcast(workspaceId: string, event: unknown): void {
  const payload = JSON.stringify(event);
  for (const client of clients) {
    if (client.workspaceId === workspaceId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

// Subscribe to Redis pub/sub
const subscriber = new Redis(REDIS_URL);
subscriber.subscribe(CHANNEL, (err) => {
  if (err) console.error('[realtime] Redis subscribe error:', err);
  else console.log(`[realtime] Subscribed to ${CHANNEL}`);
});

subscriber.on('message', (_channel: string, message: string) => {
  try {
    const event = JSON.parse(message) as { workspaceId?: string };
    if (event.workspaceId) {
      broadcast(event.workspaceId, event);
    }
  } catch (err) {
    console.error('[realtime] Failed to parse event:', err);
  }
});

// WebSocket server
const server = createServer();
const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
  const client: Client = { ws };
  clients.add(client);

  console.log(`[realtime] Client connected (${clients.size} total)`);

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString()) as { type: string; workspaceId?: string };
      if (msg.type === 'auth' && msg.workspaceId) {
        client.workspaceId = msg.workspaceId;
        ws.send(JSON.stringify({ type: 'auth_ok', workspaceId: msg.workspaceId }));
      }
    } catch {
      // Ignore invalid messages
    }
  });

  ws.on('close', () => {
    clients.delete(client);
    console.log(`[realtime] Client disconnected (${clients.size} total)`);
  });

  ws.on('error', (err) => {
    console.error('[realtime] WebSocket error:', err);
    clients.delete(client);
  });

  // Send a welcome ping
  ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));
});

server.listen(PORT, () => {
  console.log(`🔌 Realtime service running on port ${PORT}`);
});
