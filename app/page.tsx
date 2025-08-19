import { splitUSvsGlobal, splitSports } from '@/lib/fetchers';

function SectionUSGlobal({ title, items }: { title: string; items: Headline[] }) {
  const { us, global } = splitUSvsGlobal(items);
  return (
    <section className="section-card">
      <h2 className="section-title">{title}</h2>
      {us.length > 0 && (
        <>
          <h3 className="sub-section">US</h3>
          {us.slice(0, 10).map((h, i) => <Item key={`us-${i}`} item={h} />)}
        </>
      )}
      {global.length > 0 && (
        <>
          <h3 className="sub-section">Global</h3>
          {global.slice(0, 10).map((h, i) => <Item key={`gl-${i}`} item={h} />)}
        </>
      )}
    </section>
  );
}

function SectionSports({ items }: { items: Headline[] }) {
  const leagues = splitSports(items);
  return (
    <section className="section-card">
      <h2 className="section-title">Sports</h2>
      {Object.entries(leagues).map(([league, stories]) => (
        stories.length > 0 && (
          <div key={league}>
            <h3 className="sub-section">{league.toUpperCase()}</h3>
            {stories.slice(0, 10).map((h, i) => <Item key={`${league}-${i}`} item={h} />)}
          </div>
        )
      ))}
    </section>
  );
}

export default function Page() {
  // existing state hooks…

  return (
    <div className="news-grid">
      <SectionUSGlobal title="Politics" items={buckets.political} />
      <SectionUSGlobal title="Financial Markets" items={buckets.financial} />
      <SectionUSGlobal title="Business" items={buckets.business} />
      <SectionSports items={buckets.sports} />
      <Section title="Health" items={buckets.health} />
      <Section title="Social" items={buckets.social} />
    </div>
  );
}
