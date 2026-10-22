// Wall-clock conversions across mismatched DST rules. Offsets behind these cases are cross-checked
// against timeanddate.com in tz-timeanddate.test.ts; these pin the user-visible results.
import { dayDiff, isNonexistent, offsetMinutes, parts, zonedToInstant } from './tz';

function convert(fromTz: string, y: number, mo: number, d: number, h: number, mi: number, toTz: string) {
  const t = zonedToInstant(fromTz, y, mo, d, h, mi);
  const p = parts(toTz, t);
  return { wall: `${p.y}-${p.mo}-${p.d} ${p.h}:${String(p.mi).padStart(2, '0')}`, days: dayDiff(p, parts(fromTz, t)), gap: offsetMinutes(toTz, t) - offsetMinutes(fromTz, t) };
}

test('US and EU switch on different weekends: London–NY gap is 4h for three weeks', () => {
  expect(convert('Europe/London', 2026, 3, 15, 9, 0, 'America/New_York')).toEqual({ wall: '2026-3-15 5:00', days: 0, gap: -240 });
  expect(convert('Europe/London', 2026, 3, 30, 9, 0, 'America/New_York')).toEqual({ wall: '2026-3-30 4:00', days: 0, gap: -300 });
  expect(convert('Europe/London', 2026, 10, 28, 9, 0, 'America/New_York')).toEqual({ wall: '2026-10-28 5:00', days: 0, gap: -240 });
});

test('opposite hemispheres: Sydney–London gap goes 11h → 10h → 9h around April', () => {
  expect(convert('Australia/Sydney', 2026, 3, 20, 9, 0, 'Europe/London').gap).toBe(-660);
  expect(convert('Australia/Sydney', 2026, 4, 2, 9, 0, 'Europe/London').gap).toBe(-600);
  expect(convert('Australia/Sydney', 2026, 4, 10, 9, 0, 'Europe/London').gap).toBe(-540);
});

test('Sydney 2:30 AM on Apr 5 happens twice; first (AEDT) is used', () => {
  expect(convert('Australia/Sydney', 2026, 4, 5, 2, 30, 'Europe/London')).toEqual({ wall: '2026-4-4 16:30', days: -1, gap: -600 });
});

test('Lord Howe skips 2:00–2:30 when its 30-minute DST starts', () => {
  expect(isNonexistent('Australia/Lord_Howe', 2026, 10, 4, 2, 15)).toBe(true);
  expect(isNonexistent('Australia/Lord_Howe', 2026, 10, 4, 2, 30)).toBe(false);
  expect(parts('Australia/Lord_Howe', zonedToInstant('Australia/Lord_Howe', 2026, 10, 4, 2, 15))).toMatchObject({ h: 2, mi: 45 });
});

test('45-minute offsets with DST: Chatham → Pago Pago is 24h 45m back', () => {
  expect(convert('Pacific/Chatham', 2026, 10, 14, 12, 0, 'Pacific/Pago_Pago')).toEqual({ wall: '2026-10-13 11:15', days: -1, gap: -1485 });
});

test('date line: Kiritimati 00:30 is two calendar days ahead of Pago Pago', () => {
  expect(convert('Pacific/Kiritimati', 2026, 10, 15, 0, 30, 'Pacific/Pago_Pago')).toEqual({ wall: '2026-10-13 23:30', days: -2, gap: -1500 });
});

test('rules that changed: Tehran had DST in 2022, not since; Mexico City likewise', () => {
  expect(convert('Asia/Tehran', 2022, 6, 1, 12, 0, 'Europe/London')).toEqual({ wall: '2022-6-1 8:30', days: 0, gap: -210 });
  expect(convert('Asia/Tehran', 2026, 6, 1, 12, 0, 'Europe/London')).toEqual({ wall: '2026-6-1 9:30', days: 0, gap: -150 });
  expect(offsetMinutes('America/Mexico_City', Date.UTC(2022, 5, 1))).toBe(-300);
  expect(offsetMinutes('America/Mexico_City', Date.UTC(2026, 5, 1))).toBe(-360);
});

test('Morocco drops to UTC+0 for Ramadan', () => {
  expect(convert('Africa/Casablanca', 2026, 3, 1, 12, 0, 'Europe/Paris')).toEqual({ wall: '2026-3-1 13:00', days: 0, gap: 60 });
  expect(convert('Africa/Casablanca', 2026, 4, 1, 12, 0, 'Europe/Paris')).toEqual({ wall: '2026-4-1 13:00', days: 0, gap: 60 });
  expect(offsetMinutes('Africa/Casablanca', Date.UTC(2026, 2, 1, 12))).toBe(0);
  expect(offsetMinutes('Africa/Casablanca', Date.UTC(2026, 3, 1, 12))).toBe(60);
});

// Luxon's fromObject seeds ambiguous times with the zone's offset *now*, so these flipped with the season.
test.each(['2026-01-15T12:00Z', '2026-07-15T12:00Z'])('fall-back times resolve the same whenever the app runs (%s)', (now) => {
  jest.useFakeTimers({ now: new Date(now) });
  expect(zonedToInstant('America/Los_Angeles', 2026, 11, 1, 1, 30)).toBe(Date.UTC(2026, 10, 1, 8, 30));
  expect(zonedToInstant('Australia/Sydney', 2026, 4, 5, 2, 30)).toBe(Date.UTC(2026, 3, 4, 15, 30));
  expect(isNonexistent('America/Los_Angeles', 2026, 3, 8, 2, 30)).toBe(true);
  jest.useRealTimers();
});

