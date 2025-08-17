export const FEEDS = {
  political: [
    { source: 'Reuters World', url: 'https://feeds.reuters.com/reuters/worldNews' },
    { source: 'BBC World', url: 'http://feeds.bbci.co.uk/news/world/rss.xml' },
    { source: 'AP World', url: 'https://apnews.com/apf-worldnews?output=rss' },
    { source: 'Al Jazeera Top', url: 'https://www.aljazeera.com/xml/rss/all.xml' }
  ],
  financial: [
    { source: 'FT Companies', url: 'https://www.ft.com/companies?format=rss' },
    { source: 'Reuters Markets', url: 'https://feeds.reuters.com/news/wealth' },
    { source: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews' }
  ],
  business: [
    { source: 'AP Business', url: 'https://apnews.com/hub/ap-top-news?output=rss' },
    { source: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml' },
    { source: 'Reuters Business', url: 'https://feeds.reuters.com/reuters/businessNews' }
  ],
  sports: [
    { source: 'ESPN Top Headlines', url: 'https://www.espn.com/espn/rss/news' },
    { source: 'BBC Sport', url: 'http://feeds.bbci.co.uk/sport/rss.xml?edition=uk' }
  ]
} as const;
