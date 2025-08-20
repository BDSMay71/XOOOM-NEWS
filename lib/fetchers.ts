// lib/fetchers.ts
import Parser from 'rss-parser';
import { FEEDS } from './feeds';
import type { BucketedNews, Headline, FeedsByCategory } from './models';

type RSSItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  contentSnippet?: string;
  enclosure?: { url?: string; type?: string };
  [key: string]: any;
};

const parser: Parser<RSSItem> = new Parser<RSSItem>({ timeout: 10000 });

/** Keep only items published today or yesterday in America/Chicago */
function isTodayOrYesterday(iso?: string, tz = 'America/Chicago'): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(+d)) return false;

  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const now = new Date();
  const todayStr = fmt.format(now);
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  const yestStr = fmt.format(y);
  const dStr = fmt.format(d);

  return dStr === todayStr || dStr === yestStr;
}

function extractImage(item: RSSItem): string | undefined {
  const mc = item['media:content'];
  if (mc) {
    if (Array.isArray(mc)) for (const m of mc) if (m?.url) return m.url as string;
    else if (typeof mc === 'object' && mc.url) return mc.url as string;
  }
  const mt = item['media:thumbnail'];
  if (mt) {
    if (Array.isArray(mt)) for (const m of mt) if (m?.url) return m.url as string;
    else if (typeof mt === 'object' && mt.url) return mt.url as string;
  }
  if (item.enclosure?.url) return item.enclosure.url;
  return undefined;
}

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
  if (/(nfl draft|nba draft|mlb draft|nhl draft)/i.test(text)) return 'Draft';
  if (/\bsoccer|football\b/.test(t)) return 'Football/Soccer';
  if (/cricket|ipl/.test(t)) return 'Cricket';
  if (/rugby/.test(t)) return 'Rugby';
  if (/olympic|medal/.test(t)) return 'Olympics';
  return undefined;
}

/** Normalize a single feed to Headline[] and filter to today/yesterday */
export async function fetchFeed(
  url: string,
  source: string,
  category: string
): Promise<Headline[]> {
  const feed = await parser.parseURL(url);
  const items = feed.items ?? [];

  return items
    .map((item): Headline | null => {
      const title = item.title?.trim();
      const link = item.link?.trim();
      if (!title || !link) return null;

      return {
        title,
        link,
        source,
        category,
        publishedAt: item.isoDate,
        summary: item.contentSnippet,
        imageUrl: extractImage(item),
        league: category === 'sports'
          ? detectLeague(`${title} ${item.contentSnippet ?? ''}`)
          : undefined
      };
    })
    .filter((x): x is Headline => Boolean(x))
    .filter((x) => isTodayOrYesterday(x.publishedAt)); // <<< filter here
}

export async function fetchAllFeeds(
  feedsByCategory: FeedsByCategory = FEEDS as unknown as FeedsByCategory
): Promise<BucketedNews> {
  const buckets: BucketedNews = {};
  const categoryEntries = Object.entries(feedsByCategory);

  await Promise.all(
    categoryEntries.map(async ([category, entries]) => {
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

export async function fetchAllBuckets(): Promise<BucketedNews> {
  return fetchAllFeeds();
}

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

/** Google News RSS for arbitrary queries (used by /api/local); filtered to today/yesterday */
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
      if (!title || !link) return null;

      return {
        title,
        link,
        source: sourceName,
        category,
        publishedAt: item.isoDate,
        summary: item.contentSnippet,
        imageUrl: extractImage(item)
      };
    })
    .filter((x): x is Headline => Boolean(x))
    .filter((x) => isTodayOrYesterday(x.publishedAt)); // <<< filter here too
}
