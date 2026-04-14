const API_BASE = process.env['WADDLE_API_URL'] ?? 'http://localhost:4000/api/v1';
const TOKEN = process.env['WADDLE_TOKEN'];
const WORKSPACE_ID = process.env['WADDLE_WORKSPACE_ID'];

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  if (WORKSPACE_ID) headers['X-Workspace-Id'] = WORKSPACE_ID;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json() as { data?: T; error?: { message: string } };

  if (!response.ok) {
    throw new ApiError(response.status, data.error?.message ?? `HTTP ${response.status}`);
  }

  return data.data as T;
}

export function printJson(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

export function printTable(rows: Record<string, unknown>[], columns: string[]): void {
  if (rows.length === 0) {
    console.log('No results.');
    return;
  }

  const widths = columns.map((col) =>
    Math.max(col.length, ...rows.map((r) => String(r[col] ?? '').length)),
  );

  const header = columns.map((col, i) => col.padEnd(widths[i]!)).join('  ');
  const divider = widths.map((w) => '-'.repeat(w)).join('  ');

  console.log(header);
  console.log(divider);

  for (const row of rows) {
    const line = columns.map((col, i) => String(row[col] ?? '').padEnd(widths[i]!)).join('  ');
    console.log(line);
  }
}
