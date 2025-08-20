'use client';

import { useState } from 'react';
import styles from './NewsGrid.module.css';
import type { BucketedNews, Headline } from '@lib/models';

type Props = { buckets: BucketedNews };

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
const DEFAULT_VISIBLE = 10; // top 10 with "More"

export default function NewsGrid({ buckets }: Props) {
  const categories = Object.keys(buckets)
    .sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b));

  if (!categories.length) {
    return <div className={styles.empty}>No feeds loaded yet.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {categories.map((category) => {
        const headlines = buckets[category] || [];
        if (!headlines.length) return null;

        const displayName = CATEGORY_LABELS[category] ?? category;

        // Sports → by league; others → by source
        const bySubgroup =
          category === 'sports'
            ? groupBy(headlines, (h) => (h.league ?? 'Other'))
            : groupBy(headlines, (h) => h.source);

        const subgroupKeys = Object.keys(bySubgroup).sort();

        return (
          <section key={category} className={styles.categoryBlock}>
            <h2 className={styles.categoryHeading}>{displayName}</h2>

            <div className={styles.grid}>
              {subgroupKeys.map((key) => (
                <Card key={key} title={key} items={bySubgroup[key]} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function Card({ title, items }: { title: string; items: Headline[] }) {
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  const showMore = visible < items.length;

  return (
    <div className={styles.card}>
      <h3 className={styles.sourceHeading}>{title}</h3>
      <ul className={styles.list}>
        {items.slice(0, visible).map((h, i) => (
          <li key={`${title}-${i}`} className={styles.item}>
            {h.imageUrl ? (
              <img className={styles.thumb} src={h.imageUrl} alt="" loading="lazy" />
            ) : (
              <div className={styles.thumb} aria-hidden="true" />
            )}
            <div className={styles.content}>
              <a href={h.link} target="_blank" rel="noreferrer" className={styles.link}>
                {h.title}
              </a>
              <div className={styles.meta}>
                {h.source}
                {h.publishedAt ? ` • ${new Date(h.publishedAt).toLocaleString()}` : ''}
              </div>
              {h.summary && <p className={styles.snippet}>{h.summary}</p>}
            </div>
          </li>
        ))}
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
