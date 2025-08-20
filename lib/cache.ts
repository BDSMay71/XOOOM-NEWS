// lib/cache.ts

type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<any>>();

/**
 * Simple in-memory async cache.
 * Usage: await cached("key", () => fetchData(), 5*60_000)
 */
export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = 5 * 60_000
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) return hit.value as T;

  const value = await fn();
  store.set(key, { value, expiresAt: now + ttlMs });
  return value;
}
