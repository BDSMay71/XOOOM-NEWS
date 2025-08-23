'use client';

import { useMemo, useState } from 'react';
import styles from './NewsGrid.module.css';
import type { BucketedNews, Headline } from '@/lib/models';
import { proxiedThumb, faviconFor } from '@/lib/thumbs';

type Props = { buckets: BucketedNews };

function groupBy<T, K extends string | number>(arr: T[], getKey: (x: T) => K): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const k = getKey(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}

/** round-robin distribute an array into N buckets */
function distribute<T>(items: T[], n: number): T[][] {
  const out = Array.from({ length: n }, () => [] as T[]);
  items.forEach((it, i) => out[i % n].push(it));
  return out;
}

/** split a list into N chunks (balanced, order-preserving) */
function splitInto<T>(items: T[], n: number): T[][] {
  if (n <= 1) return [items];
  const out = Array.from({ length: n }, () => [] as T[]);
  let i = 0;
  for (const item of items) { out[i].push(item); i = (i + 1) % n; }
  return out;
}

/** newest first */
function ts(d?: string): number {
  const t = d ? Date.parse(d) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

const CATEGORY_LABELS: Record<string, string> = {
  political: 'Political',
  financial: 'Financial',
  business:  'Business',
  sports:    'Sports',
  health:    'Health',
  social:    'Culture',
};
const CATEGORY_ORDER = ['political', 'financial', 'business', 'sports', 'health', 'social'];
const DEFAULT_VISIBLE = 10;

/** Map Political sources so BBC + AP share one subgroup title */
function politicalKey(source: string): string {
  if (source === 'BBC World Politics' || source === 'AP Politics') {
    return 'Independent (BBC + AP)';
  }
  return source;
}

export default function NewsGrid({ buckets }: Props) {
  const categories = Object.keys(buckets).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  );
  if (!categories.length) return <div className={styles.empty}>No feeds loaded yet.</div>;

  return (
    <div className={styles.wrapper}>
      {categories.map((category) => (
        <CategorySection key={category} category={category} items={buckets[category] || []} />
      ))}
    </div>
  );
}

function CategorySection({ category, items }: { category: string; items: Headline[] }) {
  if (items.length === 0) return null;

  const displayName = CATEGORY_LABELS[category] ?? category;

  // Group by source (or league for sports) — with SPECIAL handling for Political
  const groups = useMemo(() => {
    const g = {} as Record<string, Headline[]>;
    for (const h of items) {
      const key =
        category === 'sports'
          ? (h.league ?? 'Other')
          : category === 'political'
            ? politicalKey(h.source)
            : h.source;
      (g[key] ||= []).push(h);
    }
    // sort newest first within each group
    for (const k of Object.keys(g)) g[k] = g[k].slice().sort((a, b) => ts(b.publishedAt) - ts(a.publishedAt));
    return g;
  }, [items, category]);

  // Prepare "blocks" = { title, items[] }
  let blocks = Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, arr]) => ({ title, items: arr }));

  // Ensure we fill 3 columns even with 1–2 groups by splitting the biggest group
  if (blocks.length === 1) {
    const only = blocks[0];
    const [c1, c2, c3] = splitInto(only.items, 3);
    blocks = [
      { title: only.title, items: c1 },
      { title: only.title, items: c2 },
      { title: only.title, items: c3 },
    ];
  } else if (blocks.length === 2) {
    const [a, b] = blocks.slice().sort((x, y) => y.items.length - x.items.length);
    const [c1, c2] = splitInto(a.items, 2);
    blocks = [
      { title: a.title, items: c1 },
      { title: b.title, items: b.items },
      { title: a.title, items: c2 },
    ];
  }

  // Distribute blocks across exactly 3 columns (round-robin)
  const columns = distribute(blocks, 3);

  return (
    <section id={category} className={styles.categoryBlock}>
      <h2 className={styles.categoryHeading}>{displayName}</h2>

      <div className={styles.columns}>
        {columns.map((col, idx) => (
          <div key={idx} className={styles.column}>
            {col.map((block, bi) => (
              <div key={`${block.title}-${bi}`} className={styles.block}>
                <h3 className={styles.blockHeader}>{block.title}</h3>
                <BlockList items={block.items} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function BlockList({ items }: { items: Headline[] }) {
  const [visible, setVisible] = useState(DEFAULT_VISIBLE);
  const showMore = visible < items.length;
  const first = items[0];
  const rest = items.slice(1, visible);

  return (
    <>
      <ul className={styles.list}>
        {first && <ArticleRow item={first} featured />}
        {rest.map((it, i) => <ArticleRow key={`r-${i}`} item={it} />)}
      </ul>

      {showMore && (
        <div className={styles.moreRow}>
          <button className={styles.moreBtn} onClick={() => setVisible(v => v + 10)}>More</button>
        </div>
      )}
    </>
  );
}

function ArticleRow({ item, featured = false }: { item: Headline; featured?: boolean }) {
  const raw = item.imageUrl;
  const proxied = proxiedThumb(raw) ?? faviconFor(item.link);
  return (
    <li className={`${styles.item} ${featured ? styles.featured : ''}`}>
      <img className={`${styles.thumb} ${featured ? styles.thumbLarge : ''}`} src={proxied} alt="" loading="lazy" />
      <div className={styles.content}>
        <a href={item.link} target="_blank" rel="noreferrer" className={styles.link}>{item.title}</a>
        <div className={styles.meta}>
          {item.source}
          {item.publishedAt ? ` • ${new Date(item.publishedAt).toLocaleString()}` : ''}
        </div>
      </div>
    </li>
  );
}
