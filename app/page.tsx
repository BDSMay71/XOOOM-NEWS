'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { splitUSvsGlobal, splitSports } from '@/lib/fetchers';

type Headline = { title: string; link: string; source: string; pubDate?: string; image?: string; citations?: number };
type Buckets  = { political: Headline[]; financial: Headline[]; business: Headline[]; sports: Headline[]; health: Headline[]; social: Headline[] };

export default function Page() {
  const [buckets, setBuckets] = useState<Buckets | null>(null);
  const [local, setLocal]     = useState<{ headlines: Headline[]; geo?: any; query?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setLoading(true);
    const [g, l] = await Promise.all([
      fetch('/api/news').then(r => r.json()),
      fetch('/api/local').then(r => r.json())
    ]);
    setBuckets(g.data);
    setLocal({ headlines: l.headlines, geo: l.geo, query: l.query });
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  async function refresh() { setRefreshing(true); await load(); setRefreshing(false); }

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap'}}>
        <h1>XOOOM News — From the World to Your Street</h1>
        <button onClick={refresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      <div className="time">{new Date().toLocaleString()}</div>

      {loading && <p>Loading headlines…</p>}
      {!loading && buckets && (
        <>
          <div className="news-grid">
            <SectionUSGlobal title="Politics"          items={buckets.political} />
            <SectionUSGlobal title="Financial Markets" items={buckets.financial} />
            <SectionUSGlobal title="Business"          items={buckets.business} />
            <SectionSports items={buckets.sports} />
            <Section title="Health" items={buckets.health} />
            <Section title="Social" items={buckets.social} />
            <Section
              title={
                local?.geo?.city
                  ? `Local — ${local.geo.city}${local.geo.region ? `, ${local.geo.region}` : ''}${local.geo.country ? ` • ${local.geo.country}` : ''}`
                  : 'Local News'
              }
              items={(local?.headlines || []).slice(0, 24)}
            />
          </div>

          <div className="footer">
            <div>© {new Date().getFullYear()} XOOOM</div>
            <div>Sources: Reuters, BBC, AP, Al Jazeera, FT, ESPN, WHO, STAT, Verge</div>
          </div>
        </>
      )}
    </>
  );
}

/* ===== Sections ===== */

function SectionUSGlobal({ title, items }: { title: string; items: Headline[] }) {
  if (!items?.length) return null;
  const { us, global } = splitUSvsGlobal(items);
  return (
    <section className="section-card">
      <h2 className="section-title">{title}</h2>
      {us.length > 0 && <>
        <h3 className="sub-section">US</h3>
        <ItemsList items={us} max={10} />
      </>}
      {global.length > 0 && <>
        <h3 className="sub-section">Global</h3>
        <ItemsList items={global} max={10} />
      </>}
    </section>
  );
}

function SectionSports({ items }: { items: Headline[] }) {
  if (!items?.length) return null;
  const leagues = splitSports(items);
  return (
    <section className="section-card">
      <h2 className="section-title">Sports</h2>
      {Object.entries(leagues).map(([name, stories]) =>
        stories.length ? (
          <div key={name}>
            <h3 className="sub-section">{name}</h3>
            <ItemsList items={stories} max={10} />
          </div>
        ) : null
      )}
    </section>
  );
}

function Section({ title, items }: { title: string; items: Headline[] }) {
  if (!items?.length) return null;
  return (
    <section className="section-card">
      <h2 className="section-title">{title}</h2>
      <ItemsList items={items} max={10} />
    </section>
  );
}

function ItemsList({ items, max }: { items: Headline[]; max: number }) {
  const [expanded, setExpanded] = useState(false);
  const byNewest = (a: Headline, b: Headline) =>
    (b.pubDate ? Date.parse(b.pubDate) : 0) - (a.pubDate ? Date.parse(a.pubDate) : 0);
  const byCitedThenNewest = (a: Headline, b: Headline) => {
    const ca = a.citations ?? 1, cb = b.citations ?? 1;
    if (cb !== ca) return cb - ca;
    return byNewest(a, b);
  };
  const sorted = [...items].sort(byCitedThenNewest);
  const visible = expanded ? sorted : sorted.slice(0, max);
  return (
    <>
      <div className="items-list">
        {visible.map((h, i) => <Item key={i} item={h} />)}
      </div>
      {sorted.length > max && (
        <div className="more-row">
          <button onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Show less' : `Show more (${sorted.length - max})`}
          </button>
        </div>
      )}
    </>
  );
}

function Item({ item }: { item: Headline }) {
  const [img, setImg] = useState<string | undefined>(item.image);
  useEffect(() => {
    let mounted = true;
    async function go() {
      if (!item.image && item.link) {
        try {
          const r = await fetch(`/api/og?url=${encodeURIComponent(item.link)}`);
          const j = await r.json();
          if (mounted && j?.image) setImg(j.image);
        } catch {}
      }
    }
    go();
    return () => { mounted = false; };
  }, [item.image, item.link]);

  return (
    <div className="item">
      <div className="thumb">{img ? <Image src={img} alt="" width={64} height={64} style={{ objectFit:'cover' }} /> : null}</div>
      <div>
        <a href={item.link} target="_blank" rel="noreferrer">{item.title}</a>
        <div className="badge">
          {item.source}
          {item.pubDate ? ` • ${new Date(item.pubDate).toLocaleString()}` : ''}
          {typeof item.citations === 'number' && item.citations > 1 ? ` • ${item.citations} sources` : ''}
        </div>
      </div>
    </div>
  );
}
