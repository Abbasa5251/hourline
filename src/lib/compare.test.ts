import { bestRun, dayColumns, kindOf, overlapScores, workCounts } from './compare';
import { parts } from './tz';

const SF = 'America/Los_Angeles';

test('kindOf boundaries', () => {
  expect(kindOf({ h: 9, mi: 0 })).toBe('work');
  expect(kindOf({ h: 17, mi: 59 })).toBe('work');
  expect(kindOf({ h: 18, mi: 0 })).toBe('free');
  expect(kindOf({ h: 21, mi: 30 })).toBe('free');
  expect(kindOf({ h: 22, mi: 0 })).toBe('night');
  expect(kindOf({ h: 6, mi: 59 })).toBe('night');
});

test('dayColumns has 24, 25 and 23 hours around DST', () => {
  expect(dayColumns(SF, Date.UTC(2026, 9, 14, 20))).toHaveLength(24);
  expect(dayColumns(SF, Date.UTC(2026, 10, 1, 20))).toHaveLength(25); // fall back
  expect(dayColumns(SF, Date.UTC(2026, 2, 8, 20))).toHaveLength(23); // spring forward
  const cols = dayColumns(SF, Date.UTC(2026, 9, 14, 20));
  expect(parts(SF, cols[0])).toMatchObject({ d: 14, h: 0, mi: 0 });
  expect(parts(SF, cols[23])).toMatchObject({ d: 14, h: 23 });
});

test('best overlap prefers hours the home city is awake for', () => {
  const zones = [SF, 'Europe/London', 'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney'];
  const cols = dayColumns(SF, Date.UTC(2026, 9, 14, 20));
  const counts = workCounts(cols, zones);
  expect(counts[1]).toBe(3); // 1 AM SF: London, Mumbai, Tokyo working…
  expect(counts[17]).toBe(3); // …5 PM SF: SF, Tokyo, Sydney working
  expect(bestRun(overlapScores(cols, zones)).start).toBe(17);
});

test('bestRun picks the first longest-valued run', () => {
  expect(bestRun([0, 2, 3, 3, 1, 3])).toEqual({ start: 2, end: 3, max: 3 });
  expect(bestRun([])).toEqual({ start: -1, end: -1, max: 0 });
});
