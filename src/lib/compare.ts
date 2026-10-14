import { DAY, HOUR, parts, zonedToInstant, type Parts } from './tz';

export type Kind = 'work' | 'free' | 'night';

/** Work 9–18, free 7–9 and 18–22, otherwise asleep (local time). */
export function kindOf(p: Pick<Parts, 'h' | 'mi'>): Kind {
  const hf = p.h + p.mi / 60;
  if (hf >= 9 && hf < 18) return 'work';
  if ((hf >= 7 && hf < 9) || (hf >= 18 && hf < 22)) return 'free';
  return 'night';
}

/** Instant of every local hour of the day containing `at` in `tz` — 23 or 25 on DST-change days. */
export function dayColumns(tz: string, at: number): number[] {
  const p = parts(tz, at);
  const start = zonedToInstant(tz, p.y, p.mo, p.d, 0, 0);
  const n = parts(tz, start + DAY + 12 * HOUR); // safely inside the next day
  const end = zonedToInstant(tz, n.y, n.mo, n.d, 0, 0);
  return Array.from({ length: Math.round((end - start) / HOUR) }, (_, k) => start + k * HOUR);
}

/** Working-city count per column for the given zones. */
export function workCounts(cols: number[], zones: string[]): number[] {
  return cols.map((c) => zones.filter((tz) => kindOf(parts(tz, c)) === 'work').length);
}

/**
 * Ranking per column: working-city count, with ties broken toward hours when the home city
 * (zones[0]) is working, then free — so SF 1 AM never beats SF 5 PM at the same count.
 */
export function overlapScores(cols: number[], zones: string[]): number[] {
  const bonus: Record<Kind, number> = { work: 0.5, free: 0.25, night: 0 };
  return workCounts(cols, zones).map((n, k) => n + bonus[kindOf(parts(zones[0], cols[k]))]);
}

/** First run of columns [start, end] holding the highest value. */
export function bestRun(counts: number[]): { start: number; end: number; max: number } {
  const max = Math.max(0, ...counts);
  const start = counts.indexOf(max);
  let end = start;
  while (end + 1 < counts.length && counts[end + 1] === max) end++;
  return { start, end, max };
}
