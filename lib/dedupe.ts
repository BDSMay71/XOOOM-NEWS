const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

export function dedupe<T extends { title: string }>(items: T[], limit = 25): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const key = normalize(it.title);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
    if (out.length >= limit) break;
  }
  return out;
}
