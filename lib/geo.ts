// lib/geo.ts

export type Geo = {
  city?: string;
  region?: string;
  country?: string;
};

/** Pull basic geo from request headers / querystring */
export function detectGeo(req: Request): Geo {
  const url = new URL(req.url);
  // Allow override via query (?city=Austin&region=TX&country=US)
  const qCity = url.searchParams.get('city') || undefined;
  const qRegion = url.searchParams.get('region') || undefined;
  const qCountry = url.searchParams.get('country') || undefined;
  if (qCity || qRegion || qCountry) return { city: qCity, region: qRegion, country: qCountry };

  // Vercel geo headers (best-effort)
  const city = req.headers.get('x-vercel-ip-city') || undefined;
  const region = req.headers.get('x-vercel-ip-country-region') || undefined;
  const country = req.headers.get('x-vercel-ip-country') || undefined;

  return { city, region, country };
}

/** Build a simple search string for Google News */
export function buildLocalQuery(geo: Geo): string {
  return [geo.city, geo.region, geo.country].filter(Boolean).join(' ');
}
