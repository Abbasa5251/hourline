import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AlarmIcon, ChevronDownIcon, SwapVerticalIcon } from '@/components/icons';
import { Pressable } from '@/components/pressable';
import { useWallPicker } from '@/components/wall-picker';
import { SUGGESTED, type City } from '@/lib/cities';
import {
  dayDiff,
  dstInfo,
  formatClock,
  formatDate,
  isNonexistent,
  nextTransition,
  offsetMinutes,
  parts,
  relLabel,
  transitionClock,
  utcLabel,
  zoneAbbr,
  zonedToInstant,
  type Wall,
} from '@/lib/tz';
import { useApp } from '@/state/app-state';
import { eyebrow, fonts, palette, useTheme } from '@/theme';

const clockText = (c: { time: string; period: string }) => (c.period ? `${c.time} ${c.period}` : c.time);

// Only warn about clock changes that are close enough to matter; further out, the card is hidden.
const NOTICE_DAYS = 30;

/** Next clock change for either city within NOTICE_DAYS, phrased for the DST card; null when there is none. */
function dstNotice(from: City, to: City, inst: number, h24: boolean) {
  if (from.id === to.id)
    return {
      title: 'Same city',
      body: 'Pick two different cities to compare.',
    };
  const next = [from, to]
    .map((c) => ({ c, ch: nextTransition(c.tz, inst, NOTICE_DAYS) }))
    .filter((x) => x.ch)
    .sort((a, b) => a.ch!.at - b.ch!.at)[0];
  if (!next) return null;
  const { c, ch } = next as { c: City; ch: { at: number; delta: number } };
  const hrs = Math.abs(ch.delta) / 60;
  const after = offsetMinutes(to.tz, ch.at) - offsetMinutes(from.tz, ch.at);
  const gap = after === 0 ? `the same time as ${from.name}` : `${relLabel(after)}${after > 0 ? ' of' : ''} ${from.name}`;
  return {
    title: `Clocks change on ${formatDate(c.tz, ch.at - 60_000)}`,
    body: `${c.name} ${ch.delta < 0 ? 'falls back' : 'springs forward'} ${hrs} ${hrs === 1 ? 'hr' : 'hrs'} at ${clockText(formatClock(transitionClock(c.tz, ch.at), h24))}. After that, ${to.name} will be ${gap}.`,
  };
}

export default function Convert() {
  const t = useTheme();
  const { home, cities, convert, setConvert, prefs } = useApp();
  const picker = useWallPicker();

  const from = convert.from ?? home;
  const to = convert.to ?? cities.find((c) => c.id !== from.id) ?? SUGGESTED.find((c) => c.tz !== from.tz)!;
  // What the user typed, as wall-clock fields in the From city. Starts at "now there".
  const [wall, setWall] = useState<Wall>(() => parts(from.tz, Date.now()));

  const inst = zonedToInstant(from.tz, wall.y, wall.mo, wall.d, wall.h, wall.mi);
  const skipped = isNonexistent(from.tz, wall.y, wall.mo, wall.d, wall.h, wall.mi);
  const fromP = parts(from.tz, inst);
  const toP = parts(to.tz, inst);
  const result = formatClock(toP, prefs.h24);
  const dd = dayDiff(toP, fromP);
  const toOff = offsetMinutes(to.tz, inst);
  // timeanddate-style: abbreviation with its UTC offset, e.g. "BST (UTC+1)".
  const abbr = zoneAbbr(to.tz, inst);
  const toAbbr = `${abbr ? `${abbr} (${utcLabel(toOff)})` : utcLabel(toOff)}${dstInfo(to.tz, inst).active ? ' · DST' : ''}`;
  const others = [home, ...cities].filter((c, i, all) => c.id !== from.id && c.id !== to.id && all.findIndex((x) => x.id === c.id) === i).slice(0, 3);
  // UTC is always listed last as a neutral reference.
  const rows = [...others.map((c) => ({ id: c.id, name: c.name, tz: c.tz })), { id: 'utc', name: 'UTC', tz: 'UTC' }];
  const dst = dstNotice(from, to, inst, prefs.h24);

  const swap = () => {
    setConvert({ from: to, to: from });
    setWall(toP); // keep the same moment
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.header}>
          <Text style={[eyebrow, { color: t.muted }]}>Convert</Text>
          <Text accessibilityRole="header" style={[styles.title, { color: t.ink }]}>
            Pick a time, see it anywhere
          </Text>
        </View>

        <View style={[styles.fromCard, { borderColor: t.ink, backgroundColor: t.card }]}>
          <Text style={[styles.cardLabel, { color: t.muted }]}>From</Text>
          <CitySelect city={from} color={t.ink} onPress={() => router.push({ pathname: '/add-city', params: { mode: 'from' } })} />
          <View style={styles.fields}>
            <Field
              label="Date"
              value={formatDate('UTC', Date.UTC(wall.y, wall.mo - 1, wall.d, 12), {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              onPress={() => picker.open('date', wall, (w) => setWall({ ...wall, y: w.y, mo: w.mo, d: w.d }))}
            />
            <Field
              label="Time"
              value={clockText(formatClock(wall, prefs.h24))}
              onPress={() => picker.open('time', wall, (w) => setWall({ ...wall, h: w.h, mi: w.mi }))}
            />
          </View>
          {skipped ? (
            <Text accessibilityRole="alert" style={styles.warning}>
              {clockText(formatClock(wall, prefs.h24))} doesn’t exist in {from.name} that day; clocks jump forward. Showing{' '}
              {clockText(formatClock(fromP, prefs.h24))}.
            </Text>
          ) : null}
        </View>

        <View style={styles.swapRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Swap cities"
            onPress={swap}
            style={[styles.swap, { borderColor: t.ink, backgroundColor: t.bg }]}>
            <SwapVerticalIcon color={t.ink} size={20} />
          </Pressable>
        </View>

        <View style={styles.toCard}>
          <Text style={[styles.cardLabel, { color: palette.ink }]}>To</Text>
          <CitySelect city={to} color={palette.ink} onPress={() => router.push({ pathname: '/add-city', params: { mode: 'to' } })} />
          <View style={styles.resultRow} accessible accessibilityLabel={`${clockText(result)} in ${to.name}`}
            accessibilityLiveRegion="polite">
            <Text style={styles.resultTime}>{result.time}</Text>
            {result.period ? <Text style={styles.resultPeriod}>{result.period}</Text> : null}
          </View>
          <Text style={styles.resultDate}>
            {formatDate(to.tz, inst)} ·{' '}
            {dd > 0 ? `+${dd} ${dd === 1 ? 'day' : 'days'}` : dd < 0 ? `−${-dd} ${dd === -1 ? 'day' : 'days'}` : 'Same day'}
          </Text>
          <View style={styles.chips}>
            <Text style={[styles.chip, styles.chipDark]}>{relLabel(toOff - offsetMinutes(from.tz, inst))}</Text>
            <Text style={[styles.chip, styles.chipOutline]}>{toAbbr}</Text>
          </View>
        </View>

        <View style={styles.others}>
          <Text style={[eyebrow, styles.othersLabel, { color: t.muted }]}>Same moment elsewhere</Text>
          {rows.map((c) => {
            const p = parts(c.tz, inst);
            return (
              <View key={c.id} style={[styles.otherRow, { borderTopColor: t.line }]}>
                <Text numberOfLines={1} style={[styles.otherName, { color: t.ink }]}>
                  {c.name}
                </Text>
                <View style={styles.otherRight}>
                  <Text style={[styles.otherTime, { color: t.ink }]}>{clockText(formatClock(p, prefs.h24))}</Text>
                  <Text style={[styles.otherDate, { color: t.muted }]}>{formatDate(c.tz, inst, { month: 'short', day: 'numeric' })}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {dst && (
          <View style={styles.dstCard}>
            <AlarmIcon color={palette.ink} />
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={styles.dstTitle}>{dst.title}</Text>
              <Text style={styles.dstBody}>{dst.body}</Text>
            </View>
          </View>
        )}
      </ScrollView>
      {picker.element}
    </SafeAreaView>
  );
}

function CitySelect({ city, color, onPress }: { city: City; color: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityHint="Opens city search" onPress={onPress} style={styles.select}>
      <Text numberOfLines={1} style={[styles.selectText, { color }]}>
        {city.name}
      </Text>
      <ChevronDownIcon color={color} size={18} />
    </Pressable>
  );
}

function Field({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, gap: 4 }}>
      <Text style={[styles.cardLabel, { color: t.muted }]}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={`Change ${label.toLowerCase()}`}
        onPress={onPress}
        style={[styles.field, { borderColor: t.dark ? t.line : '#CFC5B2', backgroundColor: t.bg }]}>
        <Text numberOfLines={2} style={[styles.fieldText, { color: t.ink }]}>
          {value}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: 4, paddingHorizontal: 20, paddingTop: 12 },
  title: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.2 },
  fromCard: {
    marginHorizontal: 20,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
    gap: 10,
    borderRadius: 24,
    borderWidth: 2,
  },
  cardLabel: { ...eyebrow, fontSize: 10, letterSpacing: 1.6 },
  select: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectText: { flexShrink: 1, fontFamily: fonts.display, fontSize: 22 },
  fields: { flexDirection: 'row', gap: 10 },
  field: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderRadius: 12,
  },
  fieldText: { fontFamily: fonts.bodySemi, fontSize: 15 },
  warning: {
    padding: 10,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: palette.coral,
    color: palette.ink,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    lineHeight: 17,
  },
  swapRow: { height: 0, alignItems: 'center', zIndex: 1 },
  swap: {
    position: 'absolute',
    top: -22,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toCard: {
    marginHorizontal: 20,
    marginTop: 6,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 18,
    gap: 6,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: palette.ink,
    backgroundColor: palette.apricot,
  },
  resultRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  resultTime: {
    fontFamily: fonts.display,
    fontSize: 56,
    letterSpacing: -1.6,
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  resultPeriod: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 1,
    color: palette.ink,
  },
  resultDate: { fontFamily: fonts.bodySemi, fontSize: 14, color: palette.ink },
  chips: { flexDirection: 'row', gap: 6, paddingTop: 4 },
  chip: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    letterSpacing: 0.6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  chipDark: { backgroundColor: palette.ink, color: palette.cream },
  chipOutline: {
    borderWidth: 1.5,
    borderColor: palette.ink,
    color: palette.ink,
  },
  others: { marginHorizontal: 20, marginTop: 18 },
  othersLabel: { fontSize: 10, paddingBottom: 6 },
  otherRow: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    gap: 8,
  },
  otherName: {
    flexShrink: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  otherRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  otherTime: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    fontVariant: ['tabular-nums'],
  },
  otherDate: {
    width: 64,
    textAlign: 'right',
    fontFamily: fonts.bodySemi,
    fontSize: 11,
  },
  dstCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: palette.ink,
    backgroundColor: palette.lavender,
  },
  dstTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: palette.ink },
  dstBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: palette.ink,
  },
});
