// app/api/img/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

function bad(msg = 'Bad Request', code = 400) {
  return new NextResponse(msg, { status: code });
}

function refererFor(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();

    // Known picky hosts
    if (host.endsWith('wsj.com') || host.endsWith('images.wsj.net')) return 'https://www.wsj.com/';
    if (host.endsWith('cnbcfm.com')) return 'https://www.cnbc.com/';
    if (host.endsWith('ft.com')) return 'https://www.ft.com/';
    if (host.endsWith('bbci.co.uk') || host.endsWith('bbc.co.uk')) return 'https://www.bbc.co.uk/';
    if (host.endsWith('reutersmedia.net') || host.endsWith('reuters.com')) return 'https://www.reuters.com/';

    // Default to origin
    return u.origin + '/';
  } catch {
    return 'https://www.google.com/';
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('u');
  if (!url) return bad('Missing ?u', 400);

  try {
    const upstream = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36',
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        Referer: refererFor(url),
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      next: { revalidate: 21600 }, // 6h
    });

    if (!upstream.ok || !upstream.body) {
      return bad('Upstream fetch failed', 502);
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    return new NextResponse(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, s-maxage=21600, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return bad('Proxy error', 502);
  }
}
