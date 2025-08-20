// app/api/local/route.ts
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { detectGeo, buildLocalQuery } from '@lib/geo';
import { cached } from '@lib/cache';
import { fetchLocalGoogleNews } from '@lib/fetchers';

export async function GET(req: Request) {
  const geo = detectGeo(req);

  // Your buildLocalQuery currently returns { query, locale }
  const { query, locale } = buildLocalQuery(geo);
  const key = `local_${query}_${locale}`;

  const headlines = await cached(
    key,
    () =>
      fetchLocalGoogleNews(query, {
        category: 'local',
        sourceName: locale ? `Google News (${locale})` : 'Google News Local'
      }),
    5 * 60_000
  );

  return NextResponse.json({
    ok: true,
    geo,
    query,
    locale,
    count: headlines.length,
    headlines,
    ts: Date.now()
  });
}
