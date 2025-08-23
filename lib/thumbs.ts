// lib/thumbs.ts
export function proxiedThumb(src?: string): string | undefined {
  if (!src) return undefined;
  try {
    // ensure absolute and encode
    const u = new URL(src, 'https://dummy.base/');
    return `/api/img?u=${encodeURIComponent(u.href.replace('https://dummy.base/', ''))}`;
  } catch {
    return `/api/img?u=${encodeURIComponent(src)}`;
  }
}

export function faviconFor(link: string): string {
  try {
    const host = new URL(link).hostname;
    return `/api/img?u=${encodeURIComponent(`https://www.google.com/s2/favicons?domain=${host}&sz=128`)}`;
  } catch {
    return `/api/img?u=${encodeURIComponent('https://www.google.com/s2/favicons?domain=news.google.com&sz=128')}`;
  }
}
