// app/api/local/route.ts
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { fetchLocalGoogleNews } from '@/lib/fetchers';

function buildQueryFromHeaders(req: Request) {
  const h = new Headers(req.headers);
  const city = h.get('x-vercel-ip-city') || '';
  const region = h.get('x-vercel-ip-country-region') || h.get('x-vercel-ip-region') || '';
  const country = h.get('x-vercel-ip-country') || '';
  const parts = [city, region, country].filter(Boolean);
  const core = parts.length ? parts.join(' ') : 'near me';
  return `news ${core}`;
}

export async function GET(req: Request) {
  const query = buildQueryFromHeaders(req);
  const headlines = await fetchLocalGoogleNews(query, {
    category: 'local',
    sourceName: 'Google News (Local)',
  });
  return NextResponse.json({ ok: true, query, count: headlines.length, headlines, ts: Date.now() });
}
