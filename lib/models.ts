// lib/models.ts

export type Headline = {
  title: string;
  link: string;            // canonical URL
  source: string;          // key from FEEDS (e.g., "nyt", "bloomberg")
  publishedAt?: string;    // ISO string (e.g., item.isoDate)
  summary?: string;        // item.contentSnippet or similar
  tickers?: string[];      // optional post-processing
};

export type BucketedNews = Record<string, Headline[]>;
