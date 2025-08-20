// lib/models.ts

export type Headline = {
  title: string;
  link: string;
  source: string;        // e.g., "Reuters Business"
  category: string;      // e.g., "business", "sports", "health", "social"
  publishedAt?: string;  // ISO string
  summary?: string;
  tickers?: string[];
  league?: string;       // sports-only grouping
  imageUrl?: string;     // thumbnail if present in feed
};

export type BucketedNews = Record<string, Headline[]>;

export type FeedEntry = { source: string; url: string };
export type FeedsByCategory = Record<string, ReadonlyArray<FeedEntry>>;
