// lib/models.ts

/** One normalized article from any feed */
export type Headline = {
  title: string;
  link: string;            // canonical URL
  source: string;          // e.g., "Reuters Politics", "FT Markets"
  category: string;        // e.g., "political", "financial", "sports", "health", "social"
  publishedAt?: string;    // ISO date if provided by the feed
  summary?: string;        // contentSnippet / description
  tickers?: string[];      // optional post-processing
  league?: string;         // ONLY for sports (e.g., "NFL", "NBA", "MLB", ...)
};

/** Bucket headlines by FEEDS category key */
export type BucketedNews = Record<string, Headline[]>;

export type FeedEntry = { source: string; url: string };
export type FeedsByCategory = Record<string, ReadonlyArray<FeedEntry>>;
