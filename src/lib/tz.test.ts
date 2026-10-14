import {
  dayDiff,
  dstInfo,
  formatClock,
  isNonexistent,
  nextTransition,
  offsetMinutes,
  parts,
  relLabel,
  transitionClock,
  utcLabel,
  zoneAbbr,
  zonedToInstant,
} from './tz';

const SF = 'America/Los_Angeles';
const BASE = Date.UTC(2026, 9, 14, 23, 21); // Wed Oct 14 2026, 4:21 PM in SF

describe('parts / offsets', () => {
  test('SF wall time and weekday', () => {
    expect(parts(SF, BASE)).toEqual({ y: 2026, mo: 10, d: 14, h: 16, mi: 21, wd: 2 });
  });

  test('midnight is hour 0, not 24', () => {
    expect(parts(SF, Date.UTC(2026, 9, 15, 7, 0)).h).toBe(0);
  });

  test.each([
    ['America/Los_Angeles', -420],
    ['Europe/London', 60],
    ['Asia/Kolkata', 330],
    ['Asia/Kathmandu', 345],
    ['Australia/Sydney', 660],
    ['Australia/Lord_Howe', 660],
    ['Pacific/Kiritimati', 840],
    ['Pacific/Pago_Pago', -660],
  ])('%s offset on Oct 14 2026 is %i', (tz, off) => {
    expect(offsetMinutes(tz, BASE)).toBe(off);
  });
});

describe('DST', () => {
  test('London leaves BST on Oct 25 2026 at 01:00 UTC', () => {
    expect(nextTransition('Europe/London', BASE)).toEqual({ at: Date.UTC(2026, 9, 25, 1, 0), delta: -60 });
    expect(offsetMinutes('Europe/London', Date.UTC(2026, 9, 26, 12))).toBe(0);
  });

  test('SF falls back on Nov 1 2026 at 09:00 UTC', () => {
    expect(nextTransition(SF, BASE)).toEqual({ at: Date.UTC(2026, 10, 1, 9, 0), delta: -60 });
  });

  test('Lord Howe uses a 30-minute DST shift', () => {
    expect(offsetMinutes('Australia/Lord_Howe', Date.UTC(2026, 6, 1))).toBe(630);
    expect(dstInfo('Australia/Lord_Howe', BASE)).toEqual({ observes: true, active: true });
  });

  test('southern hemisphere: Sydney is in DST in October', () => {
    expect(dstInfo('Australia/Sydney', BASE)).toEqual({ observes: true, active: true });
    expect(dstInfo('Europe/London', Date.UTC(2026, 9, 26))).toEqual({ observes: true, active: false });
    expect(dstInfo('Asia/Tokyo', BASE)).toEqual({ observes: false, active: false });
  });

  test('transitionClock reads the old local time at the change', () => {
    expect(transitionClock('Europe/London', Date.UTC(2026, 9, 25, 1, 0))).toEqual({ h: 2, mi: 0 }); // BST 02:00 → GMT 01:00
    expect(transitionClock(SF, Date.UTC(2026, 10, 1, 9, 0))).toEqual({ h: 2, mi: 0 });
    expect(transitionClock(SF, Date.UTC(2026, 2, 8, 10, 0))).toEqual({ h: 2, mi: 0 }); // PST 02:00 → PDT 03:00
  });

  test('DST flag is right in years when southern DST runs past May 1 (Chile 2018)', () => {
    expect(dstInfo('America/Santiago', Date.UTC(2018, 11, 1, 12))).toEqual({ observes: true, active: true });
  });

  test('no transition for zones without DST', () => {
    expect(nextTransition('Asia/Kolkata', BASE)).toBeNull();
  });
});

describe('wall time → instant', () => {
  test('ordinary time', () => {
    expect(zonedToInstant(SF, 2026, 10, 14, 16, 21)).toBe(BASE);
  });

  test('spring-forward gap: 2:30 AM on Mar 8 2026 does not exist, shifts to 3:30 PDT', () => {
    expect(isNonexistent(SF, 2026, 3, 8, 2, 30)).toBe(true);
    const t = zonedToInstant(SF, 2026, 3, 8, 2, 30);
    expect(t).toBe(Date.UTC(2026, 2, 8, 10, 30));
    expect(parts(SF, t)).toMatchObject({ h: 3, mi: 30 });
  });

  test('fall-back overlap: 1:30 AM on Nov 1 2026 resolves to the earlier (PDT) instant', () => {
    expect(isNonexistent(SF, 2026, 11, 1, 1, 30)).toBe(false);
    expect(zonedToInstant(SF, 2026, 11, 1, 1, 30)).toBe(Date.UTC(2026, 10, 1, 8, 30));
  });
});

describe('labels', () => {
  test('date line: Kiritimati is a day ahead of Pago Pago', () => {
    expect(dayDiff(parts('Pacific/Kiritimati', BASE), parts('Pacific/Pago_Pago', BASE))).toBe(1);
  });

  test('relLabel', () => {
    expect(relLabel(0)).toBe('Same time');
    expect(relLabel(60)).toBe('1 hr ahead');
    expect(relLabel(480)).toBe('8 hrs ahead');
    expect(relLabel(-750)).toBe('12h 30m behind');
  });

  test('formatClock 12h / 24h', () => {
    expect(formatClock({ h: 0, mi: 5 })).toEqual({ time: '12:05', period: 'AM' });
    expect(formatClock({ h: 16, mi: 21 })).toEqual({ time: '4:21', period: 'PM' });
    expect(formatClock({ h: 0, mi: 5 }, true)).toEqual({ time: '00:05', period: '' });
  });

  test('utcLabel', () => {
    expect(utcLabel(345)).toBe('UTC+5:45');
    expect(utcLabel(-420)).toBe('UTC−7');
    expect(utcLabel(0)).toBe('UTC');
  });

  test('zoneAbbr finds regional names, null for numeric-only zones', () => {
    expect(zoneAbbr(SF, BASE)).toBe('PDT');
    expect(zoneAbbr('Asia/Kolkata', BASE)).toBe('IST');
    expect(zoneAbbr('Europe/London', BASE)).toBe('BST');
    expect(zoneAbbr('Europe/London', Date.UTC(2026, 9, 26))).toBe('GMT');
    expect(zoneAbbr('Australia/Sydney', BASE)).toBe('AEDT');
    expect(zoneAbbr('Asia/Kathmandu', BASE)).toBe('NPT');
    expect(zoneAbbr('Asia/Yerevan', BASE)).toBeNull(); // not in our list, no CLDR name → UTC label
  });
});
