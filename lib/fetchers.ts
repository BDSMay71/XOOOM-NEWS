// lib/fetchers.ts
import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import type { BucketedNews, Headline, FeedsByCategory } from './models';

// Only the fields we actually use
type RSSItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  contentSnippet?: string;
  // Some feeds use different fields; rss-parser normalizes many of these,
  // but we keep the shape narrow to avoid accidental "any"
};

const parser: Parser<RSSItem> = new Parser<RSSItem>({ timeout: 10000 });

/**
 * Fetch and normalize a single feed into Headline[].
 */
export async function fetchFeed(
  url: string,
  source: string,
  category: string
): Promise<Headline[]> {
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
        category,
        publishedAt: item.isoDate,
        summary: item.contentSnippet
      };
    })
    .filter((x): x is Headline => Boolean(x));
}

/**
 * Fetch all categories in FEEDS and return BucketedNews,
 * where each key is the FEEDS category (political, financial, etc.).
 */
export async function fetchAllFeeds(
  feedsByCategory: FeedsByCategory = FEEDS as unknown as FeedsByCategory
): Promise<BucketedNews> {
  const buckets: BucketedNews = {};

  // Iterate categories (e.g., "political", "financial", ...)
  const categoryEntries = Object.entries(feedsByCategory);

  await Promise.all(
    categoryEntries.map(async ([category, entries]) => {
      // For each category, fetch all sources in parallel, but don't fail the whole category
      const results = await Promise.allSettled(
        entries.map(({ source, url }) => fetchFeed(url, source, category))
      );

      const headlines: Headline[] = [];
      for (const r of results) {
        if (r.status === 'fulfilled') {
          headlines.push(...r.value);
        } else {
          // Keep going on individual failures
          console.error(`Failed to fetch ${category}:`, r.reason);
        }
      }

      if (headlines.length) {
        buckets[category] = headlines;
      }
    })
  );

  return buckets;
}

/**
 * Fetch just one category from FEEDS (e.g., "financial").
 */
export async function fetchCategory(
  category: string,
  feedsByCategory: FeedsByCategory = FEEDS as unknown as FeedsByCategory
): Promise<Headline[]> {
  const entries = feedsByCategory[category] ?? [];
  if (!entries.length) return [];

  const results = await Promise.allSettled(
    entries.map(({ source, url }) => fetchFeed(url, source, category))
  );

  const headlines: Headline[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') headlines.push(...r.value);
  }
  return headlines;
}
