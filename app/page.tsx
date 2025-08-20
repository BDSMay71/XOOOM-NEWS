// app/page.tsx
import { fetchAllFeeds } from '@/lib/fetchers';
import NewsGrid from './components/NewsGrid';

export default async function Page() {
  const buckets = await fetchAllFeeds();

  return (
    <main style={{ padding: '1.5rem', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: '1.6rem', lineHeight: 1.2, color: 'var(--brand-light)' }}>
        XOOOM news from the world to your street
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>
        Political, Financial, Business, Sports, Health, and Culture.
      </p>
      <NewsGrid buckets={buckets} />
    </main>
  );
}
