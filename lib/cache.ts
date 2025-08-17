type Entry<T> = { value: T; expires: number };
const store = new Map<string, Entry<any>>();
const ttl = parseInt(process.env.CACHE_TTL || '600', 10) * 1000;

export async function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) return hit.value as T;
  const value = await fn();
  store.set(key, { value, expires: now + ttl });
  return value;
}
