// app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { fetchAllFeeds } from '@lib/fetchers';
import type { BucketedNews, Headline } from '@lib/models';

function groupBy<T, K extends string | number>(
  arr: T[],
  getKey: (x: T) => K
): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = getKey(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

const CATEGORY_LABELS: Record<string, string> = {
  political: 'Political',
  financial: 'Financial',
  business:  'Business',
  sports:    'Sports',
  health:    'Health',
  social:    'Culture'
};
const CATEGORY_ORDER = ['political', 'financial', 'business', 'sports', 'health', 'social'];

function CategorySection({
  category,
  headlines
}: { category: string; headlines: Headline[] }) {
  const displayName = CATEGORY_LABELS[category] ?? category;
  const bySubgroup =
    category === 'sports'
      ? groupBy(headlines, (h) => (h.league ?? 'Other'))
      : groupBy(headlines, (h) => h.source);
  const subgroupKeys = Object.keys(bySubgroup).sort();

  return (
    <section style={{ marginTop: '2.5rem' }}>
      <h2 style={{
        margin: 0, marginBottom: '1rem', textTransform: 'capitalize',
        fontSize: '1.5rem', lineHeight: 1.2, borderBottom: '2px solid #eee', paddingBottom: '.5rem'
      }}>
        {displayName}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '1rem'
      }}>
        {subgroupKeys.map((key) => (
          <div key={key} style={{
            background: '#fff', border: '1px solid #eee', borderRadius: 8,
            padding: '.75rem', boxShadow: '0 1px 2px rgba(0,0,0,.04)'
          }}>
            <h3 style={{
              margin: 0, marginBottom: '.5rem', fontSize: '1rem', lineHeight: 1.2, color: '#333',
              borderLeft: '3px solid #0a84ff', paddingLeft: '.5rem'
            }}>
              {key}
            </h3>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {bySubgroup[key].map((h: Headline, i: number) => (
                <li key={`${key}-${i}`} style={{ ...(i ? { marginTop: '.5rem', paddingTop: '.5rem', borderTop: '1px dashed #eee' } : {}) }}>
                  <a href={h.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#0a0a0a' }}>
                    {h.title}
                  </a>
                  <div style={{ fontSize: '.75rem', color: '#777', marginTop: '.25rem' }}>
                    {h.source}
                    {h.publishedAt ? ` • ${new Date(h.publishedAt).toLocaleString()}` : ''}
                  </div>
                  {h.summary && <p style={{ margin: '.25rem 0 0', fontSize: '.9rem', color: '#444' }}>{h.summary}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Page() {
  const buckets: BucketedNews = await fetchAllFeeds();
  const categories = Object.keys(buckets).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );

  return (
    <main style={{ padding: '2rem', maxWidth: 1400, margin: '0 auto' }}>
      <h1 style={{ margin: 0, fontSize: '2rem', lineHeight: 1.2 }}>
        XOOOM news from the world to your street
      </h1>
      <p style={{ color: '#666', marginTop: 8 }}>
        Grouped by category — Political, Financial, Business, Sports, Health, and Culture.
      </p>

      {!categories.length ? (
        <div style={{ marginTop: '2rem', color: '#666' }}>No feeds loaded yet.</div>
      ) : (
        categories.map((c) =>
          (buckets[c]?.length ? <CategorySection key={c} category={c} headlines={buckets[c]} /> : null)
        )
      )}
    </main>
  );
}
