import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import { BucketedNews, Headline } from './types';
import { dedupe } from './dedupe';

// Keep enclosure/media fields from RSS (useful if you added thumbnails)
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

function firstMediaUrl(item: any): string | undefined {
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
  return (feed.items || []).slice(0, 30).map((item: any) => ({
    title: item.title || 'Untitled',
    link: (item.link || '').replace(/^http:/, 'https:'),
    source,
    pubDate: item.pubDate,
    image: firstMediaUrl(item)
  }));
}

export async function fetchBucket(category: keyof typeof FEEDS): Promise<Headline[]> {
  const lists = await Promise.allSettled(FEEDS[category].map(f => fetchFeed(f.url, f.source)));
  const merged = lists.filter(r => r.status === 'fulfilled').flatMap((r: any) => r.value as Headline[]);
  merged.sort((a, b) => (b.pubDate ? Date.parse(b.pubDate) : 0) - (a.pubDate ? Date.parse(a.pubDate) : 0));
  return dedupe(merged, 25);
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
  // locale like "en-US" → ceid needs "US:en" and gl "US"
  const gl = (locale.split('-').pop() || 'US').toUpperCase();
  const hl = locale;
  const ceid = `${gl}:${(locale.split('-')[0] || 'en').toLowerCase()}`;

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(hl)}&gl=${encodeURIComponent(gl)}&ceid=${encodeURIComponent(ceid)}`;
  const feed = await fetchFeed(url, 'Google News');
  return dedupe(feed, 30);
}
