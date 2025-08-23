import { fetchAllFeeds } from '@/lib/fetchers';
import NewsGrid from './components/NewsGrid';
import LocalNewsSection from './components/LocalNewsSection';

export default async function Page() {
  const buckets = await fetchAllFeeds();

  return (
    <main className="container" style={{ paddingBlock: '1.25rem' }}>
      <h1 className="pageTitle">XOOOM news from the world to your street</h1>
      <p className="pageSub">Local, Political, Financial, Business, Sports, Health, and Culture.</p>

      {/* Local first */}
      <LocalNewsSection />

      {/* Existing global categories */}
      <div id="political" />
      <div id="financial" />
      <div id="business" />
      <div id="sports" />
      <div id="health" />
      <div id="social" />
      <NewsGrid buckets={buckets} />
    </main>
  );
}
