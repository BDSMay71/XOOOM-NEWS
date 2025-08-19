import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import { BucketedNews, Headline } from './types';

// rss-parser with media fields (handy if you're showing thumbnails)
const parser: any = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'XOOOM/1.0 (+https://example.com)' },
  customFields: {
    item: [
      ['enclosure', 'enclosure'],
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }]
    ]
  }
});

function mediaUrl(item: any): string | undefined {
  const enc = item?.enclosure?.url || item?.enclosure?.url?.url;
  if (enc) return enc;
  const mc = item?.mediaContent?.[0]?.$?.url || item?.mediaContent?.[0]?.url;
  if (mc) return mc;
  const mt = item?.mediaThumbnail?.[0]?.$?.url || item?.mediaThumbnail?.[0]?.url;
  if (mt) return mt;
  return undefined;
}

async function fetchFeed(url: string, source: string): Promise<Headline[]> {
  const feed = await parser.parseURL(url);
  return (feed.items || []).slice(0, 40).map((item: any) => ({
    title: item.title || 'Untitled',
    link: (item.link || '').replace(/^http:/, 'https:'),
    source,
    pubDate: item.pubDate,
    image: mediaUrl(item)
  }));
}

// Normalize titles for grouping “same story” across feeds
function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/&#\d+;|&[a-z]+;/gi, ' ')   // HTML entities
    .replace(/[^a-z0-9 ]/g, ' ')         // non-alphanum
    .replace(/\b(live|update|analysis|opinion|breaking)\b/g, '') // fluff
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchBucket(category: keyof typeof FEEDS): Promise<Headline[]> {
  const results = await Promise.allSettled(FEEDS[category].map(f => fetchFeed(f.url, f.source)));
  const merged: Headline[] = results
    .filter(r => r.status === 'fulfilled')
    .flatMap((r: any) => r.value as Headline[]);

  // Group by normalized title; count “citations”; keep the newest representative
  const groups = new Map<string, { item: Headline; count: number }>();
  for (const h of merged) {
    const key = norm(h.title);
    const ts = h.pubDate ? Date.parse(h.pubDate) : 0;
    const g = groups.get(key);
    if (!g) {
      groups.set(key, { item: { ...h }, count: 1 });
    } else {
      g.count += 1;
      // keep the more recent representative
      const gTs = g.item.pubDate ? Date.parse(g.item.pubDate) : 0;
      if (ts > gTs) g.item = { ...h };
    }
  }

  // Flatten with citations attached
  const deduped: Headline[] = Array.from(groups.values()).map(({ item, count }) => ({
    ...item,
    citations: count
  }));

  // Return a reasonable cap; UI will sort
  // (We cap to 60 so "Show more" still has depth)
  return deduped.slice(0, 60);
}

export async function fetchAllBuckets(): Promise<BucketedNews> {
  const [political, financial, business, sports] = await Promise.all([
    fetchBucket('political'),
    fetchBucket('financial'),
    fetchBucket('business'),
    fetchBucket('sports')
  ]);
  return { political, financial, business, sports };
}

export async function fetchLocalGoogleNews(query: string, locale: string): Promise<Headline[]> {
  const gl = (locale.split('-').pop() || 'US').toUpperCase();
  const hl = locale;
  const ceid = `${gl}:${(locale.split('-')[0] || 'en').toLowerCase()}`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
  const feed = await fetchFeed(url, 'Google News');

  // Local: group & cite as well (since many outlets echo the same local story)
  const groups = new Map<string, { item: Headline; count: number }>();
  for (const h of feed) {
    const key = norm(h.title);
    const ts = h.pubDate ? Date.parse(h.pubDate) : 0;
    const g = groups.get(key);
    if (!g) groups.set(key, { item: { ...h }, count: 1 });
    else {
      g.count += 1;
      const gTs = g.item.pubDate ? Date.parse(g.item.pubDate) : 0;
      if (ts > gTs) g.item = { ...h };
    }
  }
  return Array.from(groups.values()).map(({ item, count }) => ({ ...item, citations: count }));
}
