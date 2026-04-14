/**
 * Convert a string into a URL-safe slug.
 */
export function slugify(input: string): string {
  let result = input.toLowerCase().trim();
  // Remove non-word characters (except spaces and hyphens)
  result = result.replace(/[^\w\s-]/g, '');
  // Replace whitespace and underscores with a single hyphen
  result = result.replace(/[\s_]+/g, '-');
  // Collapse multiple hyphens into one using iterative approach
  // (avoids regex /-+/g which was flagged for polynomial ReDoS risk)
  while (result.includes('--')) {
    result = result.replace('--', '-');
  }
  // Remove leading/trailing hyphens
  if (result.startsWith('-')) result = result.slice(1);
  if (result.endsWith('-')) result = result.slice(0, -1);
  return result;
}
