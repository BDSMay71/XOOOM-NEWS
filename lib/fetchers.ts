import { BucketedNews, Headline } from './models';

// Utility: split US vs Global
function splitUSvsGlobal(headlines: Headline[]): { us: Headline[]; global: Headline[] } {
  const us: Headline[] = [];
  const global: Headline[] = [];
  headlines.forEach(h => {
    if (h.source?.toLowerCase().includes('us') || h.title.match(/\bUSA|US|American|Biden|Trump\b/i)) {
      us.push(h);
    } else {
      global.push(h);
    }
  });
  return { us, global };
}

// Utility: split sports by league
function splitSports(headlines: Headline[]) {
  return {
    nfl: headlines.filter(h => /NFL|football/i.test(h.title)),
    nba: headlines.filter(h => /NBA|basketball/i.test(h.title)),
    mlb: headlines.filter(h => /MLB|baseball/i.test(h.title)),
    nhl: headlines.filter(h => /NHL|hockey/i.test(h.title)),
    fifa: headlines.filter(h => /FIFA|soccer|world cup/i.test(h.title)),
    other: headlines.filter(
      h => !/NFL|NBA|MLB|NHL|FIFA|soccer|football|basketball|hockey|baseball/i.test(h.title)
    )
  };
}

export async function fetchNews(): Promise<BucketedNews> {
  // your existing API calls remain
  const raw = await fetch("https://newsapi.org/v2/top-headlines?apiKey=YOUR_KEY").then(r => r.json());

  const all: Headline[] = raw.articles.map((a: any) => ({
    title: a.title,
    link: a.url,
    source: a.source?.name || 'Unknown',
    pubDate: a.publishedAt,
    image: a.urlToImage,
    citations: 1
  }));

  return {
    political: all.filter(h => /politic|election|congress/i.test(h.title)),
    financial: all.filter(h => /stock|market|finance|fed|bond/i.test(h.title)),
    business: all.filter(h => /business|company|earnings|tech/i.test(h.title)),
    sports: all.filter(h => /sports|NFL|NBA|MLB|NHL|soccer|FIFA/i.test(h.title)),
    health: all.filter(h => /health|covid|virus|medical|hospital/i.test(h.title)),
    social: all.filter(h => /social|culture|society|trend|influencer/i.test(h.title)),
  };
}

export { splitUSvsGlobal, splitSports };
