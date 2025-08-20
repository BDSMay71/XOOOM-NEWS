// lib/fetchers.ts
import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import type { BucketedNews, Headline } from './models';

// Narrow item shape to the fields we actually use
type RSSItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  contentSnippet?: string;
};

const parser: Parser<RSSItem> = new Parser<RSSItem>({
  timeout: 10000
});

/**
 * Fetch and normalize a single feed into Headline[]
 */
export async function fetchFeed(url: string, source: string): Promise<Headline[]> {
  const feed = await parser.parseURL(url);
  const items = feed.items ?? [];

  return items
    .map((item): Headline | null => {
      const title = item.title?.trim();
      const link = item.link?.trim();

      if (!title || !link) return null;

      return {
        title,
        link,
        source,
        publishedAt: item.isoDate,
        summary: item.contentSnippet
      };
    })
    .filter((x): x is Headline => Boolean(x));
}

/**
 * Fetch all feeds defined in FEEDS and bucket by source
 */
export async function fetchAllFeeds(): Promise<BucketedNews> {
  const buckets: BucketedNews = {};

  const entries = Object.entries(FEEDS); // e.g. { nyt: 'https://...', ... }

  await Promise.all(
    entries.map(async ([source, url]) => {
      try {
        const headlines = await fetchFeed(url as string, source);
        if (headlines.length) buckets[source] = headlines;
      } catch (err) {
        // Don't crash the whole page if a single feed fails
        console.error(`Failed to fetch ${source}:`, err);
      }
    })
  );

  return buckets;
}
