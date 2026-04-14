/**
 * Parse work item references from commit messages or PR titles.
 * Supports patterns like: fixes WP-42, closes BE-123, resolves PROJ-7
 */
export function parseWorkItemRefs(text: string): Array<{ key: string; number: number }> {
  const pattern = /(?:fixes|closes|resolves|refs?)\s+([A-Z][A-Z0-9]*)-(\d+)/gi;
  const matches: Array<{ key: string; number: number }> = [];
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    matches.push({
      key: match[1].toUpperCase(),
      number: parseInt(match[2], 10),
    });
  }

  return matches;
}

/** Verify a GitHub webhook HMAC-SHA256 signature */
export async function verifyGitHubSignature(
  payload: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const { createHmac } = await import('crypto');
    const expected = `sha256=${createHmac('sha256', secret).update(payload).digest('hex')}`;
    // Constant-time comparison
    if (expected.length !== signature.length) return false;
    let result = 0;
    for (let i = 0; i < expected.length; i++) {
      result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}
