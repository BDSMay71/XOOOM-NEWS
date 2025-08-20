// app/components/NewsGrid.tsx
'use client';

import styles from './NewsGrid.module.css';
import type { BucketedNews, Headline } from '@/lib/models';

type Props = {
  buckets: BucketedNews;
};

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

export default function NewsGrid({ buckets }: Props) {
  const categories = Object.keys(buckets);

  if (!categories.length) {
    return <div className={styles.empty}>No feeds loaded yet.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {categories.map((category) => {
        const headlines = buckets[category] || [];
        const bySource = groupBy(headlines, (h) => h.source);

        return (
          <section key={category} className={styles.categoryBlock}>
            <h2 className={styles.categoryHeading}>{category}</h2>

            <div className={styles.grid}>
              {Object.entries(bySource).map(([source, items]) => (
                <div key={source} className={styles.card}>
                  <h3 className={styles.sourceHeading}>{source}</h3>

                  <ul className={styles.list}>
                    {items.map((h: Headline, i: number) => (
                      <li key={`${source}-${i}`} className={styles.item}>
                        <a href={h.link} target="_blank" rel="noreferrer" className={styles.link}>
                          {h.title}
                        </a>
                        <div className={styles.meta}>
                          {h.publishedAt ? new Date(h.publishedAt).toLocaleString() : ''}
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
