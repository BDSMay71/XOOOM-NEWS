// lib/feeds.ts
export const FEEDS = {
  politics: [
    // AP’s “Top politics” RSS:
    { source: 'AP Politics', url: 'https://apnews.com/hub/ap-top-politics?output=rss' },
    // Reuters U.S. politics feed:
    { source: 'Reuters Politics', url: 'https://feeds.reuters.com/USpoliticsNews' },

  ],
  financial: [
    { source: 'FT Markets', url: 'https://www.ft.com/markets/rss' },
    { source: 'Reuters Markets', url: 'https://www.reuters.com/markets/rss' },
    { source: 'CNBC Business', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html' },
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

// how many politics cards to show
export const SECTION_LIMITS = { politics: 12 } as const;
