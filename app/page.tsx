import { fetchAllFeeds } from '@/lib/fetchers';
import NewsGrid from './components/NewsGrid';

export default async function Page() {
  const buckets = await fetchAllFeeds();
  return (
    <main className="container" style={{ paddingBlock: '1.25rem' }}>
      <h1 className="pageTitle">XOOOM news from the world to your street</h1>
      <p className="pageSub">Political, Financial, Business, Sports, Health, and Culture.</p>
      <NewsGrid buckets={buckets} />
    </main>
  );
}
