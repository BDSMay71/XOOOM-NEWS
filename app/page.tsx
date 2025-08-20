// app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { fetchAllFeeds } from '@lib/fetchers';
import NewsGrid from '@components/NewsGrid';

export default async function Page() {
  const buckets = await fetchAllFeeds();

  return (
    <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.2 }}>
        XOOOM news from the world to your street
      </h1>
      <p style={{ color: '#666', marginTop: 8 }}>
        Grouped by category — Political, Financial, Business, Sports, Health, and Culture.
      </p>

      <NewsGrid buckets={buckets} />
    </main>
  );
}
