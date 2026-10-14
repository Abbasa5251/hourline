// Time-zone engine on Luxon, running on bundled IANA rules (see ./intl) so results are identical on every device.
import './intl'; // must load before Luxon touches Intl

import { DateTime } from 'luxon';

import { ABBR } from './abbr';

export type Parts = {
  y: number;
  mo: number; // 1-12
  d: number;
  h: number; // 0-23
  mi: number;
  wd: number; // 0 = Mon … 6 = Sun
};

/** A wall-clock date and time with no zone attached. */
export type Wall = Pick<Parts, 'y' | 'mo' | 'd' | 'h' | 'mi'>;

const MIN = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

const at = (tz: string, t: number) => DateTime.fromMillis(t, { zone: tz, locale: 'en-US' });
const wall = (tz: string, y: number, mo: number, d: number, h: number, mi: number) =>
  DateTime.fromObject({ year: y, month: mo, day: d, hour: h, minute: mi }, { zone: tz, locale: 'en-US' });

// The bundled Intl polyfill costs ~2.5 ms per lookup on a phone, and screens make hundreds. Offsets only change at
// clock changes, so cache Luxon's answer per zone for a whole UTC day, then per 15-minute window — each only when
// both ends of the window agree (no zone changes clocks twice within a day). A window containing a change is
// marked and asked exactly.
const WINDOW = 15 * MIN;
const offsetCache = new Map<string, number | null>();

function windowOffset(tz: string, t: number, size: number): number | null {
  const start = Math.floor(t / size) * size;
  const key = `${tz}|${size}|${start}`;
  let cached = offsetCache.get(key);
  if (cached === undefined) {
    if (offsetCache.size > 20_000) offsetCache.clear(); // time travel can visit many windows
    const first = at(tz, start).offset;
    cached = first === at(tz, start + size - MIN).offset ? first : null;
    offsetCache.set(key, cached);
  }
  return cached;
}

/** Minutes east of UTC for `tz` at instant `t`. */
export function offsetMinutes(tz: string, t: number): number {
  return windowOffset(tz, t, DAY) ?? windowOffset(tz, t, WINDOW) ?? at(tz, t).offset;
}

/** Local wall-clock fields: UTC fields of the instant shifted by the zone's offset. */
export function parts(tz: string, t: number): Parts {
  const d = new Date(Math.floor(t / MIN) * MIN + offsetMinutes(tz, t) * MIN);
  return { y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), wd: (d.getUTCDay() + 6) % 7 };
}

/**
 * Instant for a wall-clock time in `tz`. Luxon resolves times skipped by spring-forward by
 * shifting forward (2:30 → 3:30) and ambiguous fall-back times to the earlier instant.
 */
export function zonedToInstant(tz: string, y: number, mo: number, d: number, h: number, mi: number): number {
  return wall(tz, y, mo, d, h, mi).toMillis();
}

/** True when the wall time never happens in `tz` (skipped by spring-forward). */
export function isNonexistent(tz: string, y: number, mo: number, d: number, h: number, mi: number): boolean {
  const dt = wall(tz, y, mo, d, h, mi);
  return dt.day !== d || dt.hour !== h || dt.minute !== mi;
}

/** Whether `tz` observes DST in t's year, and whether it's in effect at `t`. */
export function dstInfo(tz: string, t: number) {
  const dt = at(tz, t);
  const jan = dt.set({ month: 1, day: 1 }).offset;
  const jul = dt.set({ month: 7, day: 1 }).offset;
  const observes = jan !== jul;
  // Not Luxon's isInDST: it compares against May, which is still DST in some southern-hemisphere years
  // (Chile 2018 ran DST to May 13), so it reported Santiago in Dec 2018 as standard time.
  return { observes, active: observes && dt.offset === Math.max(jan, jul) };
}

/** Next offset change after `t` within `days`, to the minute. Luxon has no transition API, so scan. */
export function nextTransition(tz: string, t: number, days = 120): { at: number; delta: number } | null {
  const off0 = offsetMinutes(tz, t);
  for (let k = 1; k <= days; k++) {
    let hi = t + k * DAY;
    if (offsetMinutes(tz, hi) === off0) continue;
    let lo = hi - DAY;
    while (hi - lo > MIN) {
      const mid = lo + Math.floor((hi - lo) / 2 / MIN) * MIN;
      if (offsetMinutes(tz, mid) === off0) lo = mid;
      else hi = mid;
    }
    return { at: hi, delta: offsetMinutes(tz, hi) - off0 };
  }
  return null;
}

/** What local clocks read when a transition at `at` happens, e.g. 2:00 for "at 2:00 AM clocks go back". */
export function transitionClock(tz: string, at: number): Pick<Parts, 'h' | 'mi'> {
  const before = new Date(at + offsetMinutes(tz, at - MIN) * MIN);
  return { h: before.getUTCHours(), mi: before.getUTCMinutes() };
}

/** "8 hrs ahead", "12h 30m behind", "Same time". */
export function relLabel(minutes: number): string {
  if (minutes === 0) return 'Same time';
  const a = Math.abs(minutes);
  const h = Math.floor(a / 60);
  const m = a % 60;
  const amount = m ? `${h}h ${m}m` : `${h} ${h === 1 ? 'hr' : 'hrs'}`;
  return `${amount} ${minutes > 0 ? 'ahead' : 'behind'}`;
}

/** Calendar-day difference a − b (e.g. +1 when a is already tomorrow). */
export function dayDiff(a: Parts, b: Parts): number {
  return Math.round((Date.UTC(a.y, a.mo - 1, a.d) - Date.UTC(b.y, b.mo - 1, b.d)) / DAY);
}

export function formatClock(p: Pick<Parts, 'h' | 'mi'>, h24 = false): { time: string; period: string } {
  const mm = String(p.mi).padStart(2, '0');
  if (h24) return { time: `${String(p.h).padStart(2, '0')}:${mm}`, period: '' };
  return { time: `${p.h % 12 || 12}:${mm}`, period: p.h < 12 ? 'AM' : 'PM' };
}

export function formatDate(tz: string, t: number, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return at(tz, t).toLocaleString(opts);
}

/** "UTC+5:45", "UTC−7", "UTC" — fallback label when a zone has no abbreviation. */
export function utcLabel(offset: number): string {
  if (offset === 0) return 'UTC';
  const a = Math.abs(offset);
  const m = a % 60;
  return `UTC${offset > 0 ? '+' : '−'}${Math.floor(a / 60)}${m ? `:${String(m).padStart(2, '0')}` : ''}`;
}

/** Short zone name like "PDT", "IST", "NPT"; null when neither our list nor CLDR has one (caller shows UTC±h). */
export function zoneAbbr(tz: string, t: number): string | null {
  const dt = at(tz, t);
  const own = ABBR[tz]?.[dt.offset];
  if (own) return own;
  const name = dt.offsetNameShort;
  return name && !/^(GMT|UTC)[+-]/.test(name) ? name : null;
}

export { MIN, HOUR, DAY };
