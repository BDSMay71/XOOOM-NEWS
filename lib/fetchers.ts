// lib/fetchers.ts
import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import type { BucketedNews, Headline, FeedsByCategory } from './models';

type RSSItem = {
  title?: string;
  link?: string;
  // rss-parser will map pubDate/updated/isoDate — prefer isoDate but keep both
  isoDate?: string;
  pubDate?: string;
  content?: string;           // content:encoded is normalized to `content`
  contentSnippet?: string;
  enclosure?: { url?: string; type?: string };
  [key: string]: any;         // for media:* fields
};

/**
 * IMPORTANT: capture media fields so we can pull thumbnails.
 * `keepArray: true` keeps multiple candidates when present.
 */
const parser: Parser<RSSItem> = new Parser<RSSItem>({
  timeout: 10000,
  customFields: {
    item: [
      ['media:content', 'media:content', { keepArray: true }],
      ['media:thumbnail', 'media:thumbnail', { keepArray: true }],
      ['media:group', 'media:group', { keepArray: true }],
      ['image', 'image'],
    ],
  },
});

/** Chicago-local "today or yesterday" gate */
function isTodayOrYesterday(isoLike?: string, tz = 'America/Chicago') {
  if (!isoLike) return false;
  const d = new Date(isoLike);
  if (Number.isNaN(+d)) return false;

  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const now = new Date();
  const today = fmt.format(now);
  const y = new Date(now); y.setDate(now.getDate() - 1);
  const yesterday = fmt.format(y);
  const itemDay = fmt.format(d);
  return itemDay === today || itemDay === yesterday;
}

/** Try very hard to get an image URL from RSS item */
function extractImage(item: RSSItem): string | undefined {
  // media:group can hold media:content/thumb variants
  const mg = item['media:group'];
  if (mg) {
    const arr = Array.isArray(mg) ? mg : [mg];
    for (const g of arr) {
      if (g?.['media:content']) {
        const inner = Array.isArray(g['media:content']) ? g['media:content'] : [g['media:content']];
        for (const m of inner) if (m?.url) return String(m.url);
      }
      if (g?.['media:thumbnail']) {
        const inner = Array.isArray(g['media:thumbnail']) ? g['media:thumbnail'] : [g['media:thumbnail']];
        for (const m of inner) if (m?.url) return String(m.url);
      }
    }
  }

  // media:content
  const mc = item['media:content'];
  if (mc) {
    if (Array.isArray(mc)) for (const m of mc) if (m?.url) return String(m.url);
    if (typeof mc === 'object' && mc?.url) return String(mc.url);
  }

  // media:thumbnail
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

  // <img src> inside content
  const html = item.content ?? '';
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (m?.[1]) return m[1];

  // nothing found
  return undefined;
}

/** Sports league detection */
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

/** Normalize + filter to today/yesterday */
export async function fetchFeed(url: string, source: string, category: string): Promise<Headline[]> {
  const feed = await parser.parseURL(url);
  const items = feed.items ?? [];

  return items
    .map((item): Headline | null => {
      const title = item.title?.trim();
      const link = item.link?.trim();
      // prefer isoDate; fallback to pubDate
      const published = item.isoDate || item.pubDate;
      if (!title || !link) return null;

      return {
        title,
        link,
        source,
        category,
        publishedAt: published,
        summary: undefined,                // no verbiage on UI
        imageUrl: extractImage(item),
        league: category === 'sports' ? detectLeague(`${title} ${item.contentSnippet ?? ''}`) : undefined,
      };
    })
    .filter((x): x is Headline => Boolean(x))
    .filter((x) => isTodayOrYesterday(x.publishedAt)); // keep only today/yesterday
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

/** Google News “local” — also filtered to today/yesterday */
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
    .filter((x): x is Headline => Boolean(x))
    .filter((x) => isTodayOrYesterday(x.publishedAt));
}
