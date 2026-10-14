// On-device sanity check: Jest runs on Node's ICU, the app runs on Hermes. Same expectations as tz.test.ts.
import { TAD_SAMPLES, TAD_TRANSITIONS } from './tad-fixtures';
import { dstInfo, isNonexistent, nextTransition, offsetMinutes, parts, zoneAbbr, zonedToInstant } from './tz';

const SF = 'America/Los_Angeles';
const BASE = Date.UTC(2026, 9, 14, 23, 21);

export function runTzSelfCheck(): { name: string; ok: boolean; got: string }[] {
  const checks: [string, () => unknown, unknown][] = [
    ['SF parts', () => parts(SF, BASE), { y: 2026, mo: 10, d: 14, h: 16, mi: 21, wd: 2 }],
    ['midnight h=0', () => parts(SF, Date.UTC(2026, 9, 15, 7, 0)).h, 0],
    ['Kathmandu +345', () => offsetMinutes('Asia/Kathmandu', BASE), 345],
    ['Lord Howe +660', () => offsetMinutes('Australia/Lord_Howe', BASE), 660],
    ['Kiritimati +840', () => offsetMinutes('Pacific/Kiritimati', BASE), 840],
    ['London → GMT Oct 25', () => nextTransition('Europe/London', BASE), { at: Date.UTC(2026, 9, 25, 1, 0), delta: -60 }],
    ['Sydney DST active', () => dstInfo('Australia/Sydney', BASE), { observes: true, active: true }],
    ['SF 2:30 Mar 8 nonexistent', () => isNonexistent(SF, 2026, 3, 8, 2, 30), true],
    ['SF 1:30 Nov 1 → PDT', () => zonedToInstant(SF, 2026, 11, 1, 1, 30), Date.UTC(2026, 10, 1, 8, 30)],
    ['abbr PDT', () => zoneAbbr(SF, BASE), 'PDT'],
    ['abbr IST', () => zoneAbbr('Asia/Kolkata', BASE), 'IST'],
    ['abbr BST', () => zoneAbbr('Europe/London', BASE), 'BST'],
    ['abbr AEDT', () => zoneAbbr('Australia/Sydney', BASE), 'AEDT'],
    ['abbr NPT (our list)', () => zoneAbbr('Asia/Kathmandu', BASE), 'NPT'],
    ['bundled rules active', () => typeof (Intl.DateTimeFormat as unknown as { __addTZData?: unknown }).__addTZData, 'function'],
    ['Morocco +0 since Sep 2026', () => offsetMinutes('Africa/Casablanca', Date.UTC(2026, 9, 14, 12)), 0],
  ];
  // Same timeanddate.com cross-check as tz-timeanddate.test.ts, on the device's own tz data.
  // Known exceptions: timeanddate's Morocco Dec 2018 offset (wrong), and Morocco's DST label (naming only).
  const tadWrong = Date.UTC(2018, 11, 1, 12);
  const offDiffs = TAD_SAMPLES.filter(([t, tz, off]) => !(tz === 'Africa/Casablanca' && t === tadWrong) && offsetMinutes(tz, t) !== off);
  const dstDiffs = TAD_SAMPLES.filter(([t, tz, , d]) => tz !== 'Africa/Casablanca' && dstInfo(tz, t).active !== d);
  const trDiffs = TAD_TRANSITIONS.filter(([tz, at, delta]) => {
    const got = nextTransition(tz, at - 3 * 86_400_000, 6);
    return !got || got.at !== at || got.delta !== delta;
  });
  const fmt = (rows: [number, string, ...unknown[]][]) =>
    `${rows.length} differ: ` +
    rows
      .slice(0, 4)
      .map(([t, tz, off]) => `${new Date(t).toISOString().slice(0, 16)} ${tz} tad ${off} app ${offsetMinutes(tz, t)}`)
      .join('; ');
  checks.push(
    [`timeanddate offsets (${TAD_SAMPLES.length})`, () => (offDiffs.length ? fmt(offDiffs) : 0), 0],
    [`timeanddate DST flags (${TAD_SAMPLES.length})`, () => (dstDiffs.length ? fmt(dstDiffs) : 0), 0],
    [`timeanddate clock changes (${TAD_TRANSITIONS.length})`, () => (trDiffs.length ? trDiffs.map((r) => r[0]).join(', ') : 0), 0],
    [
      `timeanddate abbreviations (${TAD_SAMPLES.length})`,
      () => {
        const d = TAD_SAMPLES.filter(([t, tz, , , a]) => !(tz === 'Africa/Casablanca' && t < Date.UTC(2026, 8, 20)) && zoneAbbr(tz, t) !== a);
        return d.length ? d.slice(0, 3).map(([t, tz, , , a]) => `${tz} ${a}≠${zoneAbbr(tz, t)}`).join('; ') : 0;
      },
      0,
    ],
  );

  // Speed of the bundled polyfill on this device (informational; always passes).
  // A Compare-sized workload: 5 zones × 24 hours of parts(), first pass (cold cache) then a redraw (warm).
  const zones = ['Europe/Rome', 'America/Chicago', 'Asia/Tokyo', 'Australia/Perth', 'Pacific/Auckland'];
  const pass = () => {
    const s0 = Date.now();
    for (const z of zones) for (let k = 0; k < 24; k++) parts(z, BASE + 40 * 86_400_000 + k * 3_600_000);
    return Date.now() - s0;
  };
  const cold = pass();
  const warm = pass();
  const n0 = Date.now();
  nextTransition('America/Los_Angeles', BASE);
  checks.push([`speed: 120 cells ${cold} ms cold / ${warm} ms warm, next DST ${Date.now() - n0} ms`, () => true, true]);

  return checks.map(([name, fn, want]) => {
    let got: unknown;
    try {
      got = fn();
    } catch (e) {
      got = `throws: ${(e as Error).message}`;
    }
    return { name, ok: JSON.stringify(got) === JSON.stringify(want), got: JSON.stringify(got) };
  });
}
