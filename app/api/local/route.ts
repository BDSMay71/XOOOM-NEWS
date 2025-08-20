// app/api/local/route.ts
export const runtime = 'nodejs';   // rss-parser needs Node.js runtime
export const revalidate = 0;

import { detectGeo, buildLocalQuery } from '@lib/geo';
import { cached } from '@lib/cache';
import { fetchLocalGoogleNews } from '@lib/fetchers';

export async function GET(req: Request) {
  const geo = detectGeo(req);
  const query = buildLocalQuery(geo) || 'United States'; // fallback

  const headlines = await cached(
    `local:${query}`,
    () => fetchLocalGoogleNews(query),
    5 * 60_000
  );

  return Response.json({ query, count: headlines.length, headlines });
}
