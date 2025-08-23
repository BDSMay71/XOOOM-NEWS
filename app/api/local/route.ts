// app/api/local/route.ts
export const runtime = 'nodejs';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { fetchLocalGoogleNews } from '@/lib/fetchers';

/**
 * Build a strict local query from headers: "<City>, <State>"
 * If either city or state is missing, return null (caller should hide Local).
 */
function buildCityState(req: Request): { city: string; state: string } | null {
  const h = new Headers(req.headers);
  const city = (h.get('x-vercel-ip-city') || '').trim();
  // Prefer US region headers for "state":
  const region = (h.get('x-vercel-ip-country-region') || h.get('x-vercel-ip-region') || '').trim();
  const country = (h.get('x-vercel-ip-country') || '').trim().toUpperCase();

  // We only show local when we have both City and State for US users
  if (!city || !region || country !== 'US') return null;
  return { city, state: region };
}

export async function GET(req: Request) {
  const loc = buildCityState(req);

  // If we cannot detect both City + State (US), return 204 → client hides Local section
  if (!loc) return new NextResponse(null, { status: 204 });

  // Query: "news <City>, <State>"
  const query = `news ${loc.city}, ${loc.state}`;

  // Pull Google News, with image-priority (handled in fetchers)
  const headlines = await fetchLocalGoogleNews(query, {
    category: 'local',
    sourceName: `Google News (${loc.city}, ${loc.state})`,
  });

  return NextResponse.json({
    ok: true,
    place: `${loc.city}, ${loc.state}`,
    query,
    count: headlines.length,
    headlines,
    ts: Date.now(),
  });
}
