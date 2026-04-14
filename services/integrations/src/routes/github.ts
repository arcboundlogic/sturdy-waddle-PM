import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { parseWorkItemRefs, verifyGitHubSignature } from '../lib/work-item-linker.js';

export const githubRoutes = new Hono();

/** GitHub OAuth callback — exchange code for access token */
githubRoutes.get('/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');

  if (!code) {
    throw new HTTPException(400, { message: 'Missing OAuth code' });
  }

  const clientId = process.env['GITHUB_CLIENT_ID'];
  const clientSecret = process.env['GITHUB_CLIENT_SECRET'];

  if (!clientId || !clientSecret) {
    throw new HTTPException(503, { message: 'GitHub OAuth not configured' });
  }

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });

    const data = await response.json() as { access_token?: string; error?: string };

    if (data.error || !data.access_token) {
      throw new HTTPException(400, { message: `GitHub OAuth error: ${data.error ?? 'unknown'}` });
    }

    // In production: store access token encrypted in DB for the workspace
    return c.json({ data: { connected: true, state } });
  } catch (err) {
    if (err instanceof HTTPException) throw err;
    throw new HTTPException(500, { message: 'GitHub OAuth failed' });
  }
});

/** GitHub webhook handler */
githubRoutes.post('/webhook', async (c) => {
  const webhookSecret = process.env['GITHUB_WEBHOOK_SECRET'];
  const signature = c.req.header('X-Hub-Signature-256') ?? '';
  const event = c.req.header('X-GitHub-Event') ?? '';

  const rawBody = await c.req.text();

  // Verify signature if secret is configured
  if (webhookSecret) {
    const isValid = await verifyGitHubSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      throw new HTTPException(401, { message: 'Invalid webhook signature' });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON payload' });
  }

  switch (event) {
    case 'push': {
      const commits = (payload['commits'] as Array<{ message: string; id: string }>) ?? [];
      const linkedItems: Array<{ sha: string; refs: Array<{ key: string; number: number }> }> = [];

      for (const commit of commits) {
        const refs = parseWorkItemRefs(commit.message);
        if (refs.length > 0) {
          linkedItems.push({ sha: commit.id, refs });
          // In production: update work items in DB, add timeline entries
          console.log(`[integrations] Commit ${commit.id.slice(0, 7)} references:`, refs);
        }
      }

      return c.json({ data: { processed: 'push', linkedItems } });
    }

    case 'pull_request': {
      const action = payload['action'] as string;
      const pr = payload['pull_request'] as { title?: string; number?: number; html_url?: string; merged?: boolean };

      if (pr?.title) {
        const refs = parseWorkItemRefs(pr.title);
        console.log(`[integrations] PR #${pr.number} (${action}) references:`, refs);

        if (action === 'closed' && pr.merged) {
          // In production: transition linked work items to 'done' status
          console.log(`[integrations] PR merged — transitioning ${refs.length} work item(s) to done`);
        }
      }

      return c.json({ data: { processed: 'pull_request', action } });
    }

    default:
      return c.json({ data: { processed: event, skipped: true } });
  }
});
