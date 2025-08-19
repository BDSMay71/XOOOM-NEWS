import { NextResponse } from 'next/server';
import { detectGeo, buildLocalQuery } from '@/lib/geo';
import { cached } from '@/lib/cache';
import { fetchLocalGoogleNews } from '@/lib/fetchers';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const geo = await detectGeo();
  const { query, locale } = buildLocalQuery(geo);
  const key = `local_${query}_${locale}`;
  const headlines = await cached(key, () => fetchLocalGoogleNews(query, locale));
  return NextResponse.json({ ok: true, geo, query, locale, headlines, ts: Date.now() });
}
