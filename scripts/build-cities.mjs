// One-off: GeoNames dump → src/data/cities.json (output is committed; rerun only to refresh).
// Usage: node scripts/build-cities.mjs <cities15000.txt> <countryInfo.txt> <timeZones.txt>
// Keeps cities with population ≥ 300k, every capital, and the largest city of every time zone
// (so zones like Australia/Lord_Howe stay searchable). Zones with no 15k+ town get an entry named
// after the zone itself, e.g. "Lord Howe".
import { readFileSync, writeFileSync } from 'node:fs';

const [citiesPath, countriesPath, zonesPath] = process.argv.slice(2);
if (!zonesPath) throw new Error('usage: build-cities.mjs <cities15000.txt> <countryInfo.txt> <timeZones.txt>');

const countries = new Map(
  readFileSync(countriesPath, 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('\t'))
    .map((c) => [c[0], c[4]]),
);

const rows = readFileSync(citiesPath, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((l) => l.split('\t'))
  .map((c) => ({ id: c[0], n: c[1], a: c[2], code: c[7], cc: c[8], p: +c[14], tz: c[17] }))
  .filter((r) => r.tz && countries.has(r.cc));

const largestPerZone = new Map();
for (const r of rows) {
  const cur = largestPerZone.get(r.tz);
  if (!cur || r.p > cur.p) largestPerZone.set(r.tz, r);
}

const keep = rows
  .filter((r) => r.p >= 300_000 || r.code === 'PPLC' || largestPerZone.get(r.tz) === r)
  .sort((x, y) => y.p - x.p)
  .map((r) => ({ id: r.id, n: r.n, ...(r.a !== r.n ? { a: r.a } : {}), c: countries.get(r.cc), tz: r.tz }));

const valid = new Set(Intl.supportedValuesOf('timeZone'));
for (const [cc, tz] of readFileSync(zonesPath, 'utf8').split('\n').slice(1).filter(Boolean).map((l) => l.split('\t'))) {
  if (largestPerZone.has(tz) || !valid.has(tz) || !countries.has(cc)) continue;
  keep.push({ id: `tz:${tz}`, n: tz.split('/').pop().replace(/_/g, ' '), c: countries.get(cc), tz });
}

writeFileSync(new URL('../src/data/cities.json', import.meta.url), JSON.stringify(keep));
console.log(`${keep.length} cities, ${largestPerZone.size} zones`);
