export interface SlackMessage {
  webhookUrl: string;
  text: string;
  blocks?: unknown[];
}

/** Send a message to a Slack incoming webhook */
export async function sendSlackMessage(message: SlackMessage): Promise<void> {
  const response = await fetch(message.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message.text, blocks: message.blocks }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack webhook failed: ${response.status} ${text}`);
  }
}
