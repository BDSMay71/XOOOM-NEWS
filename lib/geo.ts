import { headers } from 'next/headers';
import type { LocalGeo } from './types';

export async function detectGeo(): Promise<LocalGeo> {
  const hdrs = headers();
  const ip = hdrs.get('x-forwarded-for')?.split(',')[0]?.trim()
    || hdrs.get('x-real-ip')
    || hdrs.get('cf-connecting-ip')
    || '';
  const base = process.env.GEOIP_BASE_URL || 'https://ipapi.co';
  try {
    const r = await fetch(`${base}/${ip || ''}/json/`, { next: { revalidate: 600 } });
    const j = await r.json();
    return {
      ip: ip || j.ip,
      city: j.city,
      region: j.region || j.region_code || j.state,
      country: j.country_name || j.country,
      countryCode: j.country_code || j.country,
      timezone: j.timezone
    };
  } catch {
    return { ip };
  }
}

export function buildLocalQuery(geo: LocalGeo) {
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  const query = parts.length ? `${parts.join(' ')} news` : 'local news';
  const locale = process.env.GOOGLE_NEWS_LOCALE || 'en-US';
  return { query, locale };
}
