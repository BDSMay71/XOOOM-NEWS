// lib/feeds.ts
export const FEEDS = {
  political: [
    // AP first = prioritized (we’ll also sort AP block to the top in the grid)
    { source: 'AP Politics', url: 'https://apnews.com/hub/apf-politics?utm_source=rss' },
    { source: 'Reuters Politics', url: 'https://www.reuters.com/politics/rss' },
    // Sky News Politics (global/UK politics coverage)
    { source: 'Sky News Politics', url: 'https://feeds.skynews.com/feeds/rss/politics.xml' },
  ],
  financial: [
    { source: 'FT Markets', url: 'https://www.ft.com/markets/rss' },
    { source: 'Reuters Markets', url: 'https://www.reuters.com/markets/rss' },
    { source: 'WSJ Markets', url: 'https://feeds.a.dj.com/rss/RSSMarketsMain.xml' },
  ],
  business: [
    { source: 'Reuters Business', url: 'https://www.reuters.com/business/rss' },
    { source: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
    { source: 'CNBC Top Stories', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  ],
  sports: [
    { source: 'ESPN Top', url: 'https://www.espn.com/espn/rss/news' },
    { source: 'Reuters Sports', url: 'https://www.reuters.com/lifestyle/sports/rss' },
    { source: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
  ],
  health: [
    { source: 'WHO News', url: 'https://www.who.int/feeds/entity/mediacentre/news/en/rss.xml' },
    { source: 'STAT Health', url: 'https://www.statnews.com/feed/' },
    { source: 'Nature Health', url: 'https://www.nature.com/subjects/health/rss.xml' },
  ],
  social: [
    { source: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
    { source: 'Wired Culture', url: 'https://www.wired.com/feed/category/culture/latest/rss' },
    { source: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  ],
} as const;
