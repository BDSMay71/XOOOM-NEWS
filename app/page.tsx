function Section({ title, items }: { title: string; items: Headline[] }) {
  const [expanded, setExpanded] = useState(false);
  const VISIBLE = 10; // show first 10 by default

  if (!items?.length) return null;

  const visibleItems = expanded ? items : items.slice(0, VISIBLE);
  const canExpand = items.length > VISIBLE;

  const sectionId = title.toLowerCase().replace(/\s+/g, '-');

  return (
    <section className="section-card" aria-labelledby={`${sectionId}-title`}>
      <h2 id={`${sectionId}-title`} className="section-title">{title}</h2>

      <div className="items-list" id={`${sectionId}-list`}>
        {visibleItems.map((h, i) => (
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
            {expanded ? 'Show less' : `Show more (${items.length - VISIBLE})`}
          </button>
        </div>
      )}
    </section>
  );
}
