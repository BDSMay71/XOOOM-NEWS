export type Headline = {
  title: string;
  link: string;
  source: string;
  pubDate?: string;
  image?: string;
};
export type BucketedNews = {
  political: Headline[];
  financial: Headline[];
  business: Headline[];
  sports: Headline[];
};
export type LocalGeo = {
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  timezone?: string;
};
