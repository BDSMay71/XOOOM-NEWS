import { cached } from './cache';

async function extractOgImage(html: string): Promise<string | undefined> {
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]*>/i);
  if (!m) return;
  const tag = m[0];
  const urlMatch = tag.match(/content=["']([^"']+)["']/i);
  return urlMatch?.[1];
}

export async function fetchOgImage(url: string): Promise<string | undefined> {
  const key = `og_${encodeURIComponent(url)}`;
  return cached(key, async () => {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'XOOOM/1.0' } as any });
      clearTimeout(to);
      if (!res.ok) return undefined;
      const html = await res.text();
      return await extractOgImage(html);
    } catch {
      return undefined;
    }
  });
}
