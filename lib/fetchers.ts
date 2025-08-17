import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import { BucketedNews, Headline } from './types';
import { dedupe } from './dedupe';

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'XOOOM/1.0 (+https://example.com)' }
});

async function fetchFeed(url: string, source: string): Promise<Headline[]> {
  const feed = await parser.parseURL(url);
  return (feed.items || []).slice(0, 30).map(item => ({
    title: item.title || 'Untitled',
    link: (item.link || '').replace(/^http:/, 'https:'),
    source,
    pubDate: item.pubDate
  }));
}

export async function fetchBucket(category: keyof typeof FEEDS): Promise<Headline[]> {
  const lists = await Promise.allSettled(
    FEEDS[category].map(f => fetchFeed(f.url, f.source))
  );
  const merged = lists
    .filter(r => r.status === 'fulfilled')
    .flatMap((r: any) => r.value as Headline[]);
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

export async function fetchLocalGoogleNews(
  query: string,
  locale: string
): Promise<Headline[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${encodeURIComponent(locale)}&gl=${encodeURIComponent(locale.split('-').pop() || 'US')}&ceid=${encodeURIComponent((locale.split('-').pop() || 'US') + ':' + (locale.split('-')[0] || 'en'))}`;
  const feed = await fetchFeed(url, 'Google News');
  return dedupe(feed, 30);
}
