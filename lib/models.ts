// lib/models.ts

/** One normalized article from any feed */
export type Headline = {
  title: string;
  link: string;            // canonical URL
  source: string;          // e.g., "Reuters Politics", "FT Markets"
  category: string;        // e.g., "political", "financial"
  publishedAt?: string;    // ISO date if provided by the feed
  summary?: string;        // contentSnippet / description
  tickers?: string[];      // optional post-processing
};

/** Bucket headlines by FEEDS category key */
export type BucketedNews = Record<string, Headline[]>;

/** FEEDS entry shape (source + url) */
export type FeedEntry = {
  source: string;
  url: string;
};

/** FEEDS shape when grouped by category */
export type FeedsByCategory = Record<string, ReadonlyArray<FeedEntry>>;
