// lib/geo.ts

export type Geo = {
  city?: string;
  region?: string;   // e.g., "TX"
  country?: string;  // e.g., "US"
};

/** Pull basic geo from request headers / querystring */
export function detectGeo(req: Request): Geo {
  const url = new URL(req.url);
  // Allow override via query (?city=Austin&region=TX&country=US)
  const qCity = url.searchParams.get('city') || undefined;
  const qRegion = url.searchParams.get('region') || undefined;
  const qCountry = url.searchParams.get('country') || undefined;
  if (qCity || qRegion || qCountry) return { city: qCity, region: qRegion, country: qCountry };

  // Vercel geo headers (best effort)
  const city = req.headers.get('x-vercel-ip-city') || undefined;
  const region = req.headers.get('x-vercel-ip-country-region') || undefined;
  const country = req.headers.get('x-vercel-ip-country') || undefined;

  return { city, region, country };
}

/**
 * Build query + locale for Google News.
 * Returns an object so callers can destructure safely.
 */
export function buildLocalQuery(geo: Geo): { query: string; locale?: string } {
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  const query = parts.join(' ') || 'United States';

  // Locale like "US" or "US-TX" if region is available
  const locale = geo.country
    ? (geo.region ? `${geo.country}-${geo.region}` : geo.country)
    : undefined;

  return { query, locale };
}
