'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
type Headline = { title: string; link: string; source: string; pubDate?: string; };
type Buckets = { political: Headline[]; financial: Headline[]; business: Headline[]; sports: Headline[]; };

export default function Page() {
  const [buckets, setBuckets] = useState<Buckets | null>(null);
  const [local, setLocal] = useState<{ headlines: Headline[]; geo?: any; query?: string } | null>(null);
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
    <main>
      <div className="header">
        <div className="brand">
          <img src="/xooom.svg" alt="XOOOM logo" />
          <h1>XOOOM</h1>
        </div>
        <button onClick={refresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
      </div>
      <div className="tag">Fast global & local headlines — updated throughout the day</div>
      <div className="time">{new Date().toLocaleString()}</div>

      {loading && <p>Loading headlines…</p>}
      {!loading && buckets && (
        <>
          <div className="grid">
            <Section title="Global Political" items={buckets.political} />
            <Section title="Financial Markets" items={buckets.financial} />
            <Section title="Business" items={buckets.business} />
            <Section title="Sports" items={buckets.sports} />
          </div>

          <div className="local">
            <h2>
              Local News
              {local?.geo?.city && <> — {local.geo.city}{local.geo.region ? `, ${local.geo.region}` : ''} {local.geo.country ? `• ${local.geo.country}` : ''}</>}
            </h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
    </main>
  );
}

function Section({ title, items }: { title: string; items: Headline[] }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="list">
        {items.slice(0, 25).map((h, i) => (
          <Item key={i} item={h} />
        ))}
      </div>
    </div>
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
          {item.source}{item.pubDate ? ` • ${new Date(item.pubDate).toLocaleString()}` : ''}
        </div>
      </div>
    </div>
  );
}
