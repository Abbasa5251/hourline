import { TAD_SAMPLES, TAD_TRANSITIONS } from './tad-fixtures';
import { dstInfo, nextTransition, offsetMinutes, zoneAbbr } from './tz';

const iso = (t: number) => new Date(t).toISOString().slice(0, 16);

// Known, explained differences from timeanddate:
// 1. Morocco, Dec 2018: timeanddate's converter has clocks going back on 2018-10-28, contradicting its own
//    article "Morocco Abolishes Time Changes, Stays on DST". IANA (what phones use) keeps +1. We're right.
const TAD_WRONG = new Set([`${Date.UTC(2018, 11, 1, 12)} Africa/Casablanca`]);

test('UTC offsets match timeanddate for every edge-case sample', () => {
  const diffs = TAD_SAMPLES.filter(([t, tz, off]) => !TAD_WRONG.has(`${t} ${tz}`) && offsetMinutes(tz, t) !== off).map(
    ([t, tz, off]) => `${iso(t)} ${tz}: timeanddate ${off}, app ${offsetMinutes(tz, t)}`,
  );
  expect(diffs).toEqual([]);
  expect(offsetMinutes('Africa/Casablanca', Date.UTC(2018, 11, 1, 12))).toBe(60);
});

// 2. Morocco's DST flag: tzdb calls the everyday +1 standard and the Ramadan +0 DST (negative DST); timeanddate,
//    like everyone else, says the reverse. dstInfo reads tzdb the conventional way, so these agree.
test('DST in effect matches timeanddate', () => {
  const diffs = TAD_SAMPLES.filter(([t, tz, , d]) => !TAD_WRONG.has(`${t} ${tz}`) && dstInfo(tz, t).active !== d).map(
    ([t, tz, , d]) => `${iso(t)} ${tz}: timeanddate ${d}, app ${dstInfo(tz, t).active}`,
  );
  expect(diffs).toEqual([]);
});

test('clock-change moments match timeanddate to the minute', () => {
  const diffs = TAD_TRANSITIONS.filter(([tz, at, delta]) => {
    const got = nextTransition(tz, at - 3 * 86_400_000, 6);
    return !got || got.at !== at || got.delta !== delta;
  }).map(([tz, at, delta]) => `${tz} ${iso(at)} ${delta}: app ${JSON.stringify(nextTransition(tz, at - 3 * 86_400_000, 6))}`);
  expect(diffs).toEqual([]);
});

// 3. Morocco's Ramadan 2026 UTC+0 was labelled WET by timeanddate; since 2026-09-20 the same offset is GMT, which we use.
const pastMoroccoLabel = (t: number, tz: string) => tz === 'Africa/Casablanca' && t < Date.UTC(2026, 8, 20) && offsetMinutes(tz, t) === 0;

test('abbreviations match timeanddate', () => {
  const skip = (t: number, tz: string) => TAD_WRONG.has(`${t} ${tz}`) || pastMoroccoLabel(t, tz);
  const diffs = TAD_SAMPLES.filter(([t, tz, , , a]) => !skip(t, tz) && zoneAbbr(tz, t) !== a).map(
    ([t, tz, , , a]) => `${iso(t)} ${tz}: timeanddate ${a}, app ${zoneAbbr(tz, t)}`,
  );
  expect(diffs).toEqual([]);
});

test('bundled rules are in use (not the host ICU)', () => {
  expect(typeof (Intl.DateTimeFormat as unknown as { __addTZData?: unknown }).__addTZData).toBe('function');
  // Morocco went to permanent UTC+0 on 2026-09-20 (tzdb 2026b+); stale OS data still says +1.
  expect(offsetMinutes('Africa/Casablanca', Date.UTC(2026, 9, 14, 12))).toBe(0);
  // Manitoba's permanent UTC−5 arrived in tzdb 2026e; older data falls back to −6 in winter.
  expect(offsetMinutes('America/Winnipeg', Date.UTC(2027, 0, 15, 12))).toBe(-300);
});
