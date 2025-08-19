import { NextResponse } from 'next/server';
import { fetchAllBuckets } from '@/lib/fetchers';
import { cached } from '@/lib/cache';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  const data = await cached('global_news', fetchAllBuckets);
  return NextResponse.json({ ok: true, data, ts: Date.now() });
}
