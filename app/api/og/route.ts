import { NextResponse } from 'next/server';
import { fetchOgImage } from '@/lib/og';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ ok: false, error: 'Missing url' }, { status: 400 });
  const img = await fetchOgImage(url);
  return NextResponse.json({ ok: true, image: img || null });
}
