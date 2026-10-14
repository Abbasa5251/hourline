import data from '@/data/cities.json';

export type City = { id: string; name: string; country: string; tz: string };

type Row = { id: string; n: string; a?: string; c: string; tz: string };

// Sorted by population, so the first match for a zone is its biggest city.
const rows = data as Row[];
const toCity = (r: Row): City => ({ id: r.id, name: r.n, country: r.c, tz: r.tz });

const fold = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const index = rows.map((r) => ({ r, keys: [fold(r.n), r.a ? fold(r.a) : '', fold(r.c)] }));

/** Prefix match on city name (accent-insensitive), then country; biggest cities first. */
export function searchCities(query: string, limit = 50): City[] {
  const q = fold(query.trim());
  if (!q) return rows.slice(0, limit).map(toCity);
  const byName: City[] = [];
  const byCountry: City[] = [];
  for (const { r, keys } of index) {
    if (keys[0].startsWith(q) || keys[1].startsWith(q) || keys[0].includes(` ${q}`)) byName.push(toCity(r));
    else if (keys[2].startsWith(q)) byCountry.push(toCity(r));
    if (byName.length >= limit) break;
  }
  return [...byName, ...byCountry].slice(0, limit);
}

/** City for a device time zone: biggest city in that zone, else a name made from the zone id. */
export function cityForZone(tz: string): City {
  const r = rows.find((x) => x.tz === tz);
  return r ? toCity(r) : { id: `tz:${tz}`, name: tz.split('/').pop()!.replace(/_/g, ' '), country: '', tz };
}

function pick(name: string, tz: string): City {
  const r = rows.find((x) => x.n === name && x.tz === tz);
  return r ? toCity(r) : cityForZone(tz);
}

export const SUGGESTED: City[] = [
  pick('London', 'Europe/London'),
  pick('New York City', 'America/New_York'),
  pick('Tokyo', 'Asia/Tokyo'),
  pick('Mumbai', 'Asia/Kolkata'),
  pick('Sydney', 'Australia/Sydney'),
  pick('Dubai', 'Asia/Dubai'),
  pick('Paris', 'Europe/Paris'),
  pick('Singapore', 'Asia/Singapore'),
  pick('Los Angeles', 'America/Los_Angeles'),
  pick('São Paulo', 'America/Sao_Paulo'),
];

export const DEFAULT_CITIES = SUGGESTED.slice(0, 4);
