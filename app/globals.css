// lib/fetchers.ts
import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import type { BucketedNews, Headline, FeedsByCategory } from './models';

type RSSItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  content?: string;             // content:encoded normalized to `content`
  contentSnippet?: string;
  enclosure?: { url?: string; type?: string };
  [key: string]: any;           // media:* fields land here via customFields
};

/**
 * Capture media fields so we can pull thumbnails.
 * keepArray:true preserves multiple candidates.
 */
const parser: Parser<RSSItem> = new Parser<RSSItem>({
  timeout: 10000,
  customFields: {
    item: [
      ['media:group', 'media:group', { keepArray: true }],
      ['media:content', 'media:content', { keepArray: true }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: true }],
      ['image', 'image'],
    ],
  },
});

/** Try *very* hard to get an image URL from RSS item */
function extractImage(item: RSSItem): string | undefined {
  // media:group → media:content / media:thumbnail
  const mg = item['media:group'];
  if (mg) {
    const arr = Array.isArray(mg) ? mg : [mg];
    for (const g of arr) {
      const mc = g?.['media:content'];
      if (mc) {
        const inner = Array.isArray(mc) ? mc : [mc];
        for (const m of inner) if (m?.url) return String(m.url);
      }
      const mt = g?.['media:thumbnail'];
      if (mt) {
        const inner = Array.isArray(mt) ? mt : [mt];
        for (const m of inner) if (m?.url) return String(m.url);
      }
    }
  }

  // media:content / media:thumbnail at item root
  const mc = item['media:content'];
  if (mc) {
    if (Array.isArray(mc)) for (const m of mc) if (m?.url) return String(m.url);
    if (typeof mc === 'object' && mc?.url) return String(mc.url);
  }
  const mt = item['media:thumbnail'];
  if (mt) {
    if (Array.isArray(mt)) for (const m of mt) if (m?.url) return String(m.url);
    if (typeof mt === 'object' && mt?.url) return String(mt.url);
  }

  // enclosure (prefer images)
  if (item.enclosure?.url) {
    const t = item.enclosure.type ?? '';
    if (!t || /^image\//i.test(t)) return item.enclosure.url;
  }

  // <img src> within content
  const html = item.content ?? '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m?.[1]) return m[1];

  // nothing
  return undefined;
}

/** Sports league heuristic */
function detectLeague(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/(nfl|super bowl|patriots|cowboys|packers|chiefs)/i.test(text)) return 'NFL';
  if (/(nba|playoffs|lakers|warriors|celtics|bucks)/i.test(text)) return 'NBA';
  if (/(mlb|world series|yankees|dodgers|red sox|braves)/i.test(text)) return 'MLB';
  if (/(nhl|stanley cup|maple leafs|bruins|rangers|oilers)/i.test(text)) return 'NHL';
  if (/(wnba|aces|liberty)/i.test(text)) return 'WNBA';
  if (/(ncaa|college football|march madness|final four)/i.test(text)) return 'NCAA';
  if (/(epl|premier league|manchester|liverpool|arsenal|tottenham|chelsea)/i.test(text)) return 'EPL';
  if (/(uefa|champions league|la liga|bundesliga|serie a)/i.test(text)) return 'UEFA/Europe';
  if (/(messi|mls|inter miami|lafc)/i.test(text)) return 'MLS';
  if (/(f1|formula 1|grand prix|verstappen|hamilton)/i.test(text)) return 'F1';
  if (/(nascar|daytona 500|cup series)/i.test(text)) return 'NASCAR';
  if (/(pga|masters|u\.s\. open|ryder cup)/i.test(text)) return 'Golf';
  if (/(atp|wta|wimbledon|us open|australian open|roland garros|french open)/i.test(text)) return 'Tennis';
  if (/\bsoccer|football\b/.test(t)) return 'Football/Soccer';
  if (/cricket|ipl/.test(t)) return 'Cricket';
  if (/rugby/.test(t)) return 'Rugby';
  if (/olympic|medal/.test(t)) return 'Olympics';
  return undefined;
}

/** Normalize one feed */
export async function fetchFeed(url: string, source: string, category: string): Promise<Headline[]> {
  const feed = await parser.parseURL(url);
  const items = feed.items ?? [];

  return items
    .map((item): Headline | null => {
      const title = item.title?.trim();
      const link = item.link?.trim();
      const published = item.isoDate || item.pubDate;
      if (!title || !link) return null;

      return {
        title,
        link,
        source,
        category,
        publishedAt: published,
        summary: undefined, // UI shows no body text
        imageUrl: extractImage(item),
        league: category === 'sports' ? detectLeague(`${title} ${item.contentSnippet ?? ''}`) : undefined,
      };
    })
    .filter((x): x is Headline => Boolean(x));
}

export async function fetchAllFeeds(
  feedsByCategory: FeedsByCategory = FEEDS as unknown as FeedsByCategory
): Promise<BucketedNews> {
  const buckets: BucketedNews = {};
  await Promise.all(
    Object.entries(feedsByCategory).map(async ([category, entries]) => {
      const results = await Promise.allSettled(
        entries.map(({ source, url }) => fetchFeed(url, source, category))
      );
      const headlines: Headline[] = [];
      for (const r of results) if (r.status === 'fulfilled') headlines.push(...r.value);
      if (headlines.length) buckets[category] = headlines;
    })
  );
  return buckets;
}

export async function fetchAllBuckets(): Promise<BucketedNews> { return fetchAllFeeds(); }

export async function fetchCategory(
  category: string,
  feedsByCategory: FeedsByCategory = FEEDS as unknown as FeedsByCategory
): Promise<Headline[]> {
  const entries = feedsByCategory[category] ?? [];
  if (!entries.length) return [];
  const results = await Promise.allSettled(
    entries.map(({ source, url }) => fetchFeed(url, source, category))
  );
  const headlines: Headline[] = [];
  for (const r of results) if (r.status === 'fulfilled') headlines.push(...r.value);
  return headlines;
}

/** Google News local */
export async function fetchLocalGoogleNews(
  query: string,
  opts?: { category?: string; sourceName?: string }
): Promise<Headline[]> {
  const category = opts?.category ?? 'local';
  const sourceName = opts?.sourceName ?? 'Google News Local';
  const url =
    'https://news.google.com/rss/search?' +
    `q=${encodeURIComponent(query)}` +
    '&hl=en-US&gl=US&ceid=US:en';

  const feed = await parser.parseURL(url);
  const items = feed.items ?? [];

  return items
    .map((item): Headline | null => {
      const title = item.title?.trim();
      const link = item.link?.trim();
      const published = item.isoDate || item.pubDate;
      if (!title || !link) return null;

      return {
        title,
        link,
        source: sourceName,
        category,
        publishedAt: published,
        summary: undefined,
        imageUrl: extractImage(item),
      };
    })
    .filter((x): x is Headline => Boolean(x));
}
