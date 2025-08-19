import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import { BucketedNews, Headline } from './types';

const parser: any = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'XOOOM/1.0 (+https://xooomnews.com)' },
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

function norm(s: string) {
  return s
    .toLowerCase()
    .replace(/&#\d+;|&[a-z]+;/gi, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\b(live|update|analysis|opinion|breaking)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchBucket(category: keyof typeof FEEDS): Promise<Headline[]> {
  const results = await Promise.allSettled(FEEDS[category].map(f => fetchFeed(f.url, f.source)));
  const merged: Headline[] = results
    .filter(r => r.status === 'fulfilled')
    .flatMap((r: any) => r.value as Headline[]);

  // group by normalized title; count “citations”; keep newest representative
  const groups = new Map<string, { item: Headline; count: number }>();
  for (const h of merged) {
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

  const deduped: Headline[] = Array.from(groups.values()).map(({ item, count }) => ({
    ...item,
    citations: count
  }));

  return deduped.slice(0, 80);
}

export async function fetchAllBuckets(): Promise<BucketedNews> {
  const [political, financial, business, sports, health, social] = await Promise.all([
    fetchBucket('political'),
    fetchBucket('financial'),
    fetchBucket('business'),
    fetchBucket('sports'),
    fetchBucket('health'),
    fetchBucket('social')
  ]);
  return { political, financial, business, sports, health, social };
}

/* ===== UI helpers ===== */
export function splitUSvsGlobal(headlines: Headline[]): { us: Headline[]; global: Headline[] } {
  const us: Headline[] = [];
  const global: Headline[] = [];
  for (const h of headlines) {
    if (/\b(US|U\.S\.|USA|American|Congress|White House|Biden|Trump)\b/i.test(h.title) || /\bUS\b/i.test(h.source)) {
      us.push(h);
    } else {
      global.push(h);
    }
  }
  return { us, global };
}

export function splitSports(headlines: Headline[]) {
  return {
    NFL: headlines.filter(h => /\bNFL\b|american football/i.test(h.title)),
    NBA: headlines.filter(h => /\bNBA\b|basketball/i.test(h.title)),
    MLB: headlines.filter(h => /\bMLB\b|baseball/i.test(h.title)),
    NHL: headlines.filter(h => /\bNHL\b|hockey/i.test(h.title)),
    FIFA: headlines.filter(h => /\bFIFA\b|soccer|world cup/i.test(h.title)),
    Other: headlines.filter(
      h => !/\b(NFL|NBA|MLB|NHL|FIFA)\b|soccer|football|basketball|hockey|baseball/i.test(h.title)
    )
  };
}
// --- Local news from Google News RSS (query built by /api/local) ---
export async function fetchLocalGoogleNews(query: string, locale: string): Promise<Headline[]> {
  // locale like "en-US" -> gl=US, hl=en-US, ceid=US:en
  const lang = (locale.split('-')[0] || 'en').toLowerCase();
  const country = (locale.split('-')[1] || 'US').toUpperCase();
  const hl = `${lang}-${country}`;
  const gl = country;
  const ceid = `${country}:${lang}`;

  const url =
    `https://news.google.com/rss/search` +
    `?q=${encodeURIComponent(query)}` +
    `&hl=${encodeURIComponent(hl)}` +
    `&gl=${encodeURIComponent(gl)}` +
    `&ceid=${encodeURIComponent(ceid)}`;

  // reuse fetchFeed to parse and map items, then dedupe by normalized title
  const feedItems = await (async () => {
    // we can't call fetchFeed directly because it adds a hard-coded "source"
    const rss = await parser.parseURL(url);
    return (rss.items || []).slice(0, 60).map((item: any) => ({
      title: item.title || 'Untitled',
      link: (item.link || '').replace(/^http:/, 'https:'),
      source: 'Google News',
      pubDate: item.pubDate,
      image: (item.enclosure?.url) ||
             (item?.['media:content']?.[0]?.$?.url) ||
             (item?.['media:thumbnail']?.[0]?.$?.url)
    })) as Headline[];
  })();

  // group & count "citations" across duplicates; keep the newest representative
  const groups = new Map<string, { item: Headline; count: number }>();
  for (const h of feedItems) {
    const key = (h.title || '').toLowerCase()
      .replace(/&#\d+;|&[a-z]+;/gi, ' ')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
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
