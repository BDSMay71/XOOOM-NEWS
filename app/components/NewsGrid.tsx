'use client';

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
                <div key={key} className={styles.card}>
                  <h3 className={styles.sourceHeading}>{key}</h3>
                  <ul className={styles.list}>
                    {bySubgroup[key].map((h: Headline, i: number) => (
                      <li key={`${key}-${i}`} className={styles.item}>
                        <a href={h.link} target="_blank" rel="noreferrer" className={styles.link}>
                          {h.title}
                        </a>
                        <div className={styles.meta}>
                          {h.source}
                          {h.publishedAt ? ` • ${new Date(h.publishedAt).toLocaleString()}` : ''}
                        </div>
                        {h.summary && <p className={styles.snippet}>{h.summary}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
