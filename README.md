# XOOOM — Global + Local News Aggregator

This build fixes path-alias errors on Vercel by adding `baseUrl` and `paths` in `tsconfig.json` so imports like `@/lib/...` resolve correctly.

## Local
```bash
npm i
cp .env.local.example .env.local
npm run dev
```

## Deploy
1) Upload these files to a GitHub repo (top level must contain `package.json` and `app/`).  
2) In Vercel: New Project → Import repo → Deploy.

### Optional env
- `CACHE_TTL` (seconds, default 600)
- `GEOIP_BASE_URL` (default `https://ipapi.co`)
- `GOOGLE_NEWS_LOCALE` (default `en-US`)
