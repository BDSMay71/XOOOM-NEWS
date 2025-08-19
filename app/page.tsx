'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type Headline = { title: string; link: string; source: string; pubDate?: string; image?: string; citations?: number };
type Buckets  = { political: Headline[]; financial: Headline[]; business: Headline[]; sports: Headline[] };

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

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  return (
    <>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, flexWrap:'wrap'}}>
        <h1>Top Headlines — Global & Local</h1>
        <button onClick={refresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      <div className="time">{new Date().toLocaleString()}</div>

      {loading && <p>Loading headlines…</p>}

      {!loading && buckets && (
        <>
          {/* GLOBAL buckets */}
          <div className="news-grid">
            <Section title="Politics"            items={buckets.political} />
            <Section title="Financial Markets"   items={buckets.financial} />
            <Section title="Business"            items={buckets.business} />
            <Section title="Sports"              items={buckets.sports} />
          </div>

          {/* LOCAL */}
          <div className="local">
            <h2 className="section-title">
              Local News
              {local?.geo?.city && <> — {local.geo.city}{local.geo.region ? `, ${local.geo.region}` : ''} {local.geo.country ? `• ${local.geo.country}` : ''}</>}
            </h2>
            <div className="news-grid">
              <Section title={`Top near ${local?.geo?.city || 'you'}`} items={(local?.headlines || []).slice(0, 24)} />
            </div>
            <div className="time">Query: {local?.query}</div>
          </div>

          <div className="footer">
            <div>© {new Date().getFullYear()} XOOOM</div>
            <div>Sources: Reuters, BBC, AP, Al Jazeera, FT, ESPN, Google News RSS</div>
          </div>
        </>
      )}
    </>
  );
}

function Section({ title, items }: { title: string; items: Headline[] }) {
  const [expanded, setExpanded] = useState(false);
  const [sortMode, setSortMode] = useState<'auto' | 'newest'>('auto'); // 'auto' = Most cited → Newest
  const VISIBLE = 10;

  if (!items?.length) return null;

  const byNewest = (a: Headline, b: Headline) =>
    (b.pubDate ? Date.parse(b.pubDate) : 0) - (a.pubDate ? Date.parse(a.pubDate) : 0);

  const byCitedThenNewest = (a: Headline, b: Headline) => {
    const ca = a.citations ?? 1, cb = b.citations ?? 1;
    if (cb !== ca) return cb - ca;
    return byNewest(a, b);
  };

  const sorted  = [...items].sort(sortMode === 'auto' ? byCitedThenNewest : byNewest);
  const visible = expanded ? sorted : sorted.slice(0, VISIBLE);
  const canExpand = sorted.length > VISIBLE;
  const sectionId = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="section-card" aria-labelledby={`${sectionId}-title`}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
        <h2 id={`${sectionId}-title`} className="section-title">{title}</h2>
        <div className="sort-row" role="radiogroup" aria-label="Sort">
          <button
            className={sortMode === 'auto' ? 'sort-btn active' : 'sort-btn'}
            onClick={() => setSortMode('auto')}
            aria-pressed={sortMode === 'auto'}
            title="Most cited → Newest"
          >
            Most cited
          </button>
          <button
            className={sortMode === 'newest' ? 'sort-btn active' : 'sort-btn'}
            onClick={() => setSortMode('newest')}
            aria-pressed={sortMode === 'newest'}
            title="Newest first"
          >
            Newest
          </button>
        </div>
      </div>

      <div className="items-list" id={`${sectionId}-list`}>
        {visible.map((h, i) => (
          <Item key={i} item={h} />
        ))}
      </div>

      {canExpand && (
        <div className="more-row">
          <button
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            aria-controls={`${sectionId}-list`}
          >
            {expanded ? 'Show less' : `Show more (${sorted.length - VISIBLE})`}
          </button>
        </div>
      )}
    </section>
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
        } catch { /* ignore */ }
      }
    }
    go();
    return () => { mounted = false; };
  }, [item.image, item.link]);

  return (
    <div className="item">
      <div className="thumb">
        {img ? (
          <Image src={img} alt="" width={64} height={64} style={{ objectFit: 'cover' }} />
        ) : null}
      </div>
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
