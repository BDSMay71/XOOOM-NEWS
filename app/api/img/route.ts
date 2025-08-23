// app/api/img/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

function bad(msg = 'Bad Request', code = 400) {
  return new NextResponse(msg, { status: code });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('u');
  if (!url) return bad('Missing ?u', 400);

  try {
    const upstream = await fetch(url, {
      headers: {
        // Be polite; some CDNs check UA
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
        Accept: 'image/*,*/*;q=0.8',
        Referer: new URL(url).origin, // helps some anti-hotlink setups
      },
      // cache at the edge for 6 hours
      next: { revalidate: 21600 },
    });

    if (!upstream.ok || !upstream.body) {
      return bad('Upstream fetch failed', 502);
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const res = new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=21600, max-age=3600, stale-while-revalidate=86400',
      },
    });
    return res;
  } catch (err) {
    return bad('Proxy error', 502);
  }
}
