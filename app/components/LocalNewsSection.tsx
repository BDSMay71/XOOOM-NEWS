import { XOOOM_LOCAL_IMAGE } from '@/lib/placeholders';
'use client';

import { useEffect, useState } from 'react';
import styles from './NewsGrid.module.css';
import type { Headline } from '@/lib/models';
import { faviconFor, proxiedThumb } from '@/lib/thumbs';

const DEFAULT_VISIBLE = 10;

function distribute<T>(items: T[], n: number): T[][] {
  const out = Array.from({ length: n }, () => [] as T[]);
  items.forEach((it, i) => out[i % n].push(it));
  return out;
}
function splitInto<T>(items: T[], n: number): T[][] {
  if (n <= 1) return [items];
  const out = Array.from({ length: n }, () => [] as T[]);
  let i = 0;
  for (const item of items) { out[i].push(item); i = (i + 1) % n; }
  return out;
}

export default function LocalNewsSection() {
  const [items, setItems] = useState<Headline[] | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const res = await fetch('/api/local', { cache: 'no-store' });
        if (res.status === 204) { // no city+state detected → hide section
          if (!cancel) setItems([]);
          return;
        }
        const data = await res.json();
        if (!cancel) setItems(data.headlines ?? []);
      } catch {
        if (!cancel) setItems([]); // hide on error
      }
    })();
    return () => { cancel = true; };
  }, []);

  if (items === null) {
    return (
      <section id="local" className={styles.categoryBlock}>
        <h2 className={styles.categoryHeading}>Local</h2>
        <div style={{ color: 'var(--text-secondary)' }}>Loading local headlines…</div>
      </section>
    );
  }
  if (items.length === 0) return null;

  // Split evenly across 3 columns to ensure the layout always fills
  const [c1, c2, c3] = splitInto(items, 3);
  const columns = distribute(
    [{ title: 'Around You', items: c1 }, { title: 'Around You', items: c2 }, { title: 'Around You', items: c3 }],
    3
  );

  return (
    <section id="local" className={styles.categoryBlock}>
      <h2 className={styles.categoryHeading}>Local</h2>
      <div className={styles.columns}>
        {columns.map((col, idx) => (
          <div key={idx} className={styles.column}>
            {col.map((block, bi) => (
              <div key={`local-${bi}`} className={styles.block}>
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
        {rest.map((it, i) => <ArticleRow key={`lr-${i}`} item={it} />)}
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
