// lib/models.ts

export type Headline = {
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt?: string;
  summary?: string;
  imageUrl?: string;
  /** Optional, used for sports grouping */
  league?: string;
};

export type BucketedNews = Record<string, Headline[]>;

export type FeedsByCategory = Record<
  string,
  Array<{
    source: string;
    url: string;
  }>
>;
