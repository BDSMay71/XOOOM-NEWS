// app/page.tsx
import { fetchAllFeeds } from '@/lib/fetchers';
import NewsGrid from '@/components/NewsGrid';

export const dynamic = 'force-static'; // or 'force-dynamic' if you want fresh on every request

export default async function Page() {
  const buckets = await fetchAllFeeds();

  return (
    <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.2 }}>News Dashboard</h1>
      <p style={{ color: '#666', marginTop: 8 }}>
        Grouped by category, then by source. Three-column layout.
      </p>
      <NewsGrid buckets={buckets} />
    </main>
  );
}
