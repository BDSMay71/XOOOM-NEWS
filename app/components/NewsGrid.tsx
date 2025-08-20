'use client';

import { useMemo, useState } from 'react';
import styles from './NewsGrid.module.css';
import type { BucketedNews, Headline } from '@/lib/models';

type Props = { buckets: BucketedNews };

function groupBy<T, K extends string | number>(arr: T[], getKey: (x: T) => K): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = getKey(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

function packIntoColumns<T>(entries: Array<[string, T]>, n: number): Array<Array<[string, T]>> {
  const cols: Array<Array<[string, T]>> = Array.from({ length: n }, () => []);
  entries.forEach((e, i) => cols[i % n].push(e));
  return cols;
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
const DEFAULT_VISIBLE = 10;

function faviconFrom(link: string): string {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(link).hostname}&sz=64`; }
  catch { return 'https://www.google.com/s2/favicons?domain=news.google.com&sz=64'; }
}
function ts(d?: string): number {
  const t = d ? Date.parse(d) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

export default function NewsGrid({ buckets }: Props) {
  const categories = Object.keys(buckets).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );
  if (!categories.length) return <div className={styles.empty}>No feeds loaded yet.</div>;

  return (
    <div className={styles.wrapper}>
      {categories.map((category) => {
        const all = buckets[category] || [];
        if (!all.length) return null;

        const displayName = CATEGORY_LABELS[category] ?? category;
        const groups =
          category === 'sports'
            ? groupBy(all, (h) => h.league ?? 'Other')
            : groupBy(all, (h) => h.source);

        const entries = Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
        const columns = packIntoColumns(entries, 3);

        return (
          <section key={category} className={styles.categoryBlock}>
            <h2 className={styles.categoryHeading}>{displayName}</h2>

            <div className={styles.grid}>
              {columns.map((col, idx) => (
                <div key={idx} className={styles.column}>
                  {col.map(([title, items]) => (
                    <ColumnBlock key={title} title={title} items={items} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ColumnBlock({ title, items }: { title: string; items: Headline[] }) {
  // Newest first so "featured" is the most recent
  const sorted = useMemo(() => [...items].sort((a, b) => ts(b.publishedAt) - ts(a.publishedAt)), [items]);
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  const showMore = visible < sorted.length;

  const featured = sorted[0];
  const rest = sorted.slice(1, visible);

  const featThumb = (featured?.imageUrl) || faviconFrom(featured?.link || '');

  return (
    <div>
      <h3 className={styles.subHeading}>{title}</h3>
      <ul className={styles.list}>
        {featured && (
          <li className={`${styles.item} ${styles.featured}`}>
            <img className={`${styles.thumb} ${styles.thumbLarge}`} src={featThumb} alt="" loading="lazy" />
            <div className={styles.content}>
              <a href={featured.link} target="_blank" rel="noreferrer" className={styles.link}>
                {featured.title}
              </a>
              <div className={styles.meta}>
                {featured.source}
                {featured.publishedAt ? ` • ${new Date(featured.publishedAt).toLocaleString()}` : ''}
              </div>
            </div>
          </li>
        )}

        {rest.map((h, i) => {
          const thumb = h.imageUrl || faviconFrom(h.link);
          return (
            <li key={`${title}-rest-${i}`} className={styles.item}>
              <img className={styles.thumb} src={thumb} alt="" loading="lazy" />
              <div className={styles.content}>
                <a href={h.link} target="_blank" rel="noreferrer" className={styles.link}>
                  {h.title}
                </a>
                <div className={styles.meta}>
                  {h.source}
                  {h.publishedAt ? ` • ${new Date(h.publishedAt).toLocaleString()}` : ''}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {showMore && (
        <div className={styles.moreRow}>
          <button className={styles.moreBtn} onClick={() => setVisible((v) => v + 10)}>
            More
          </button>
        </div>
      )}
    </div>
  );
}
