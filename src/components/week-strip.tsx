import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { DAY, formatDate, parts, zonedToInstant, type Parts } from '@/lib/tz';
import { eyebrow, fonts, useTheme } from '@/theme';

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEK = 7 * DAY;
// Pages either side of the starting week (~10 years); FlatList only renders the few around the visible one.
const SPAN = 520;
const PAGES = Array.from({ length: 2 * SPAN + 1 }, (_, i) => i);

/** Monday noon of the week containing t. Stepping from noon means a DST change can never push a day across midnight. */
function mondayNoon(tz: string, t: number) {
  const p = parts(tz, t);
  return zonedToInstant(tz, p.y, p.mo, p.d, 12, 0) - p.wd * DAY;
}

/** "October 2026", or "Sep – Oct 2026" / "Dec 2026 – Jan 2027" for a week that spans two months. */
function monthLabel(tz: string, monday: number) {
  const sunday = monday + 6 * DAY;
  const a = parts(tz, monday);
  const b = parts(tz, sunday);
  if (a.mo === b.mo) return formatDate(tz, monday, { month: 'long', year: 'numeric' });
  const end = formatDate(tz, sunday, { month: 'short', year: 'numeric' });
  return `${formatDate(tz, monday, a.y === b.y ? { month: 'short' } : { month: 'short', year: 'numeric' })} – ${end}`;
}

/**
 * Mon–Sun week strip, swipeable a week at a time into the past or future, with the month of the week in view above it.
 * Tapping a day calls onPick with that day's date. When `at` moves to another week (dial, NOW), the strip follows.
 * Remount it (key={tz}) when the zone changes.
 */
export function WeekStrip({ tz, at, onPick }: { tz: string; at: number; onPick: (day: Parts) => void }) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const list = useRef<FlatList<number>>(null);
  const visible = useRef(-1);

  // Page SPAN is the week shown on mount. Fixed so page indexes don't shift as `at` moves.
  const [anchor] = useState(() => mondayNoon(tz, at));
  const p = parts(tz, at);
  // round(): a DST change between the two Mondays makes the gap a week ± an hour.
  const selPage = Math.min(2 * SPAN, Math.max(0, SPAN + Math.round((mondayNoon(tz, at) - anchor) / WEEK)));
  const selKey = `${p.y}-${p.mo}-${p.d}`;
  // Week in view, for the month label; follows swipes and programmatic scrolls alike.
  const [shown, setShown] = useState(selPage);

  // Bring the selected day's week back into view whenever the selected date changes (tap, dial, NOW).
  useEffect(() => {
    if (!width || visible.current === selPage) return;
    const first = visible.current === -1;
    visible.current = selPage;
    if (!first) list.current?.scrollToIndex({ index: selPage, animated: true });
  }, [selKey, selPage, width]);

  const renderWeek = ({ item: page }: { item: number }) => {
    const monday = anchor + (page - SPAN) * WEEK;
    return (
      <View style={[styles.row, { width }]}>
        {WD.map((wd, i) => {
          const day = monday + i * DAY;
          const dp = parts(tz, day);
          const sel = `${dp.y}-${dp.mo}-${dp.d}` === selKey;
          return (
            <Pressable
              key={i}
              onPress={() => onPick(dp)}
              accessibilityRole="button"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={formatDate(tz, day, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              style={[styles.day, { borderColor: sel ? t.ink : 'transparent' }]}>
              <Text maxFontSizeMultiplier={1.3} style={[styles.wd, { color: t.muted }]}>{wd}</Text>
              {/* key remounts on selection: Android (Fabric) loses borderRadius when backgroundColor changes after mount. */}
              <View key={sel ? 'on' : 'off'} style={[styles.num, { backgroundColor: sel ? t.ink : 'transparent' }]}>
                <Text maxFontSizeMultiplier={1.2} style={[styles.numText, { color: sel ? t.bg : t.ink }]}>{dp.d}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.wrap}>
      <Text accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.3} style={[eyebrow, styles.month, { color: t.muted }]}>
        {monthLabel(tz, anchor + (shown - SPAN) * WEEK)}
      </Text>
      <View style={styles.list} onLayout={(e) => setWidth(Math.round(e.nativeEvent.layout.width))}>
        {width > 0 && (
          <FlatList
            // Remount on width change (rotation) so paging and the initial week line up again.
            key={width}
            ref={list}
            data={PAGES}
            keyExtractor={String}
            renderItem={renderWeek}
            extraData={`${selKey}|${t.bg}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={selPage}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            initialNumToRender={1}
            maxToRenderPerBatch={2}
            windowSize={3}
            scrollEventThrottle={32}
            onScroll={(e) => {
              const i = Math.round(e.nativeEvent.contentOffset.x / width);
              if (i !== shown) setShown(i);
            }}
            onMomentumScrollEnd={(e) => (visible.current = Math.round(e.nativeEvent.contentOffset.x / width))}
          />
        )}
      </View>
    </View>
  );
}

// Pill keeps the mockup's 48×64 stadium on any screen width; wider phones get more space between days.
const PILL_W = 48;

const styles = StyleSheet.create({
  wrap: { paddingTop: 14, paddingBottom: 8, gap: 10 },
  month: { paddingHorizontal: 20 },
  list: { minHeight: 64 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14 },
  day: { width: PILL_W, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 2, borderRadius: PILL_W / 2 },
  wd: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: fonts.bodyBold, fontSize: 14 },
});
