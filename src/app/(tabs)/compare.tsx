import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarIcon } from '@/components/icons';
import { useWallPicker } from '@/components/wall-picker';
import { bestRun, dayColumns, kindOf, overlapScores, workCounts, type Kind } from '@/lib/compare';
import { dayDiff, formatClock, formatDate, MIN, offsetMinutes, parts, zonedToInstant } from '@/lib/tz';
import { useNow } from '@/lib/use-now';
import { useApp } from '@/state/app-state';
import { eyebrow, fonts, palette, useTheme } from '@/theme';

const CELL_W = 40;
const CELL_GAP = 4;
const COL = CELL_W + CELL_GAP;
const ROW_H = 44;
const KIND_BG: Record<Kind, string> = { work: palette.sage, free: palette.apricotSoft, night: palette.lavender };
const KIND_LABEL: Record<Kind, string> = { work: 'Work', free: 'Free', night: 'Asleep' };

function shortOffset(m: number) {
  if (m === 0) return 'Home';
  const a = Math.abs(m);
  return `${m > 0 ? '+' : '−'}${Math.floor(a / 60)}h${a % 60 ? ` ${a % 60}m` : ''}`;
}

export default function Compare() {
  const t = useTheme();
  const now = useNow();
  const { home, cities, shift, setShift, prefs } = useApp();
  const picker = useWallPicker();
  const scroller = useRef<ScrollView>(null);

  const at = now + shift * MIN;
  const rows = [home, ...cities];
  const zones = rows.map((c) => c.tz);
  const cols = dayColumns(home.tz, at);
  const counts = workCounts(cols, zones);
  const best = bestRun(overlapScores(cols, zones));
  const dayKey = cols[0];

  // Selection belongs to a day; on another day fall back to the hour being viewed.
  const [picked, setPicked] = useState<{ day: number; col: number } | null>(null);
  const atCol = Math.min(cols.length - 1, Math.max(0, Math.floor((at - dayKey) / 3_600_000)));
  const sel = picked?.day === dayKey ? picked.col : atCol;

  const scrollToCol = (k: number) => scroller.current?.scrollTo({ x: Math.max(0, (k - 1) * COL), animated: true });
  useEffect(() => {
    scrollToCol(atCol);
  }, [dayKey]); // eslint-disable-line react-hooks/exhaustive-deps -- only re-centre when the day changes

  const hp = parts(home.tz, at);
  const pickDate = () =>
    picker.open('date', hp, (w) => setShift(Math.round((zonedToInstant(home.tz, w.y, w.mo, w.d, hp.h, hp.mi) - now) / MIN)));

  const selT = cols[sel];
  const selHome = parts(home.tz, selT);
  const selClock = formatClock(selHome, prefs.h24);
  const range = (k: number) => {
    const c = formatClock(parts(home.tz, cols[k]), prefs.h24);
    return `${c.time}${c.period ? ` ${c.period}` : ''}`;
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={styles.header}>
        <View style={{ gap: 4 }}>
          <Text style={[eyebrow, { color: t.muted }]}>Compare</Text>
          <Text accessibilityRole="header" style={[styles.date, { color: t.ink }]}>{formatDate(home.tz, at, { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Pick a date" onPress={pickDate} style={[styles.iconBtn, { borderColor: t.ink }]}>
          <CalendarIcon color={t.ink} size={20} />
        </Pressable>
      </View>

      <View style={styles.legend}>
        {(['work', 'free', 'night'] as Kind[]).map((k) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: KIND_BG[k] }]} />
            <Text style={[styles.legendText, { color: t.muted }]}>{k === 'work' ? 'Work hours' : KIND_LABEL[k]}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.grid}>
          <View style={styles.labels}>
            {rows.map((c) => (
              <View key={c.id} style={styles.label}>
                <Text maxFontSizeMultiplier={1.3} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} style={[styles.labelName, { color: t.ink }]}>{c.name}</Text>
                <Text maxFontSizeMultiplier={1.3} style={[styles.labelSub, { color: t.muted }]}>
                  {c.id === home.id ? 'Home' : shortOffset(offsetMinutes(c.tz, selT) - offsetMinutes(home.tz, selT))}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView ref={scroller} horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
            <View style={{ padding: 3, paddingRight: 20, gap: 6 }}>
              <View
                pointerEvents="none"
                style={[styles.selection, { left: 1 + sel * COL, borderColor: t.ink }]}
              />
              {rows.map((c) => (
                <View key={c.id} style={styles.cellRow}>
                  {cols.map((col, k) => {
                    const p = parts(c.tz, col);
                    const kind = kindOf(p);
                    const clock = formatClock(p, prefs.h24);
                    const label = p.h === 0 && p.mi === 0 ? formatDate(c.tz, col, { weekday: 'short' }).toUpperCase() : prefs.h24 ? clock.time.replace(/:00$/, '') : `${clock.time.replace(/:00$/, '')}${clock.period[0].toLowerCase()}`;
                    return (
                      <Pressable
                        key={col}
                        onPress={() => setPicked({ day: dayKey, col: k })}
                        accessibilityRole="button"
                        accessibilityLabel={`${c.name} ${clock.time} ${clock.period}, ${KIND_LABEL[kind]}`}
                        hitSlop={{ left: CELL_GAP / 2, right: CELL_GAP / 2 }}
                        style={[styles.cell, { backgroundColor: KIND_BG[kind] }]}>
                        {/* Fixed-size grid: labels don't scale; the summary card and screen-reader labels carry the same info. */}
                        <Text allowFontScaling={false} style={styles.cellText}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={[styles.best, { borderColor: t.ink }]}>
          <View style={{ flexShrink: 1, gap: 2 }}>
            <Text style={[eyebrow, styles.bestEyebrow, { color: t.muted }]}>Best overlap today</Text>
            <Text style={[styles.bestText, { color: t.ink }]}>
              {counts[best.start] > 0
                ? `${range(best.start)} – ${range(best.end + 1 < cols.length ? best.end + 1 : best.end)} · ${counts[best.start]} of ${rows.length} working`
                : 'No shared work hours this day'}
            </Text>
          </View>
          {counts[best.start] > 0 ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setPicked({ day: dayKey, col: best.start });
                scrollToCol(best.start);
              }}
              style={[styles.selectBtn, { backgroundColor: t.ink }]}>
              <Text style={[styles.selectText, { color: t.bg }]}>SELECT</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={[styles.card, { borderColor: t.ink, backgroundColor: t.card }]}>
          <View style={styles.cardTop}>
            <View style={{ gap: 2, flexShrink: 1 }}>
              <Text style={[styles.cardTime, { color: t.ink }]}>
                {selClock.time} <Text style={styles.cardPeriod}>{selClock.period}</Text>
              </Text>
              <Text style={[styles.cardSub, { color: t.muted }]}>
                {formatDate(home.tz, selT)} · {home.name}
              </Text>
            </View>
            <Text style={[styles.badge, { backgroundColor: palette.sage }]}>
              {counts[sel]} of {rows.length} working
            </Text>
          </View>
          {cities.map((c) => {
            const p = parts(c.tz, selT);
            const kind = kindOf(p);
            const clock = formatClock(p, prefs.h24);
            const dd = dayDiff(p, selHome);
            return (
              <View key={c.id} style={[styles.otherRow, { borderTopColor: t.line }]}>
                <Text numberOfLines={1} style={[styles.otherName, { color: t.ink }]}>{c.name}</Text>
                <View style={styles.otherRight}>
                  <Text style={[styles.otherTime, { color: t.ink }]}>
                    {clock.time} {clock.period}
                  </Text>
                  <Text style={[styles.otherDd, { color: t.muted }]}>{dd > 0 ? `+${dd}` : dd < 0 ? `−${-dd}` : ''}</Text>
                  <Text style={[styles.status, { backgroundColor: KIND_BG[kind] }]}>{KIND_LABEL[kind]}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
      {picker.element}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12 },
  date: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.2 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, paddingTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 12, borderRadius: 4 },
  legendText: { fontFamily: fonts.bodySemi, fontSize: 12 },
  grid: { flexDirection: 'row', gap: 8, paddingLeft: 20, paddingTop: 16 },
  labels: { width: 104, gap: 6, paddingTop: 3 },
  label: { height: ROW_H, justifyContent: 'center', gap: 3 },
  labelName: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' },
  labelSub: { fontFamily: fonts.bodySemi, fontSize: 11 },
  selection: { position: 'absolute', top: 0, bottom: 0, width: CELL_W + 6, borderWidth: 2.5, borderRadius: 14, zIndex: 1 },
  cellRow: { flexDirection: 'row', gap: CELL_GAP, height: ROW_H },
  cell: { width: CELL_W, height: ROW_H, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontFamily: fonts.bodyBold, fontSize: 11, color: palette.ink },
  best: { marginHorizontal: 20, marginTop: 14, paddingVertical: 10, paddingLeft: 16, paddingRight: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderRadius: 18, borderWidth: 2, borderStyle: 'dashed' },
  bestEyebrow: { fontSize: 10 },
  bestText: { fontFamily: fonts.bodyBold, fontSize: 14 },
  selectBtn: { height: 44, paddingHorizontal: 16, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  selectText: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.4 },
  card: { marginHorizontal: 20, marginTop: 14, paddingHorizontal: 18, paddingVertical: 16, borderRadius: 24, borderWidth: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 12, gap: 8 },
  cardTime: { fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.6 },
  cardPeriod: { fontFamily: fonts.bodyBold, fontSize: 14 },
  cardSub: { fontFamily: fonts.bodySemi, fontSize: 12 },
  badge: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, overflow: 'hidden', color: palette.ink },
  otherRow: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, gap: 8 },
  otherName: { flexShrink: 1, fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.4, textTransform: 'uppercase' },
  otherRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  otherTime: { fontFamily: fonts.bodyBold, fontSize: 15, fontVariant: ['tabular-nums'] },
  otherDd: { width: 22, fontFamily: fonts.bodyBold, fontSize: 11 },
  status: { minWidth: 54, paddingHorizontal: 8, textAlign: 'center', fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', paddingVertical: 4, borderRadius: 999, overflow: 'hidden', color: palette.ink },
});
