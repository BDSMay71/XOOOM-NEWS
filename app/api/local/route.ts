// app/api/local/route.ts
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { detectGeo, buildLocalQuery } from '@lib/geo';
import { cached } from '@lib/cache';
import { fetchLocalGoogleNews } from '@lib/fetchers';

export async function GET(req: Request) {
  const geo = detectGeo(req);

  // Handle both legacy (string) and new ({query, locale}) returns
  const built = buildLocalQuery(geo) as unknown;
  let query: string;
  let locale: string | undefined;

  if (typeof built === 'string') {
    // Legacy behavior
    query = built;
    locale = undefined;
  } else {
    const obj = built as { query: string; locale?: string };
    query = obj.query;
    locale = obj.locale;
  }

  const key = `local_${query}_${locale ?? 'NA'}`;

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
