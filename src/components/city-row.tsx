import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import type { City } from '@/lib/cities';
import { dayDiff, dstInfo, formatClock, offsetMinutes, parts, relLabel, utcLabel, zoneAbbr } from '@/lib/tz';
import { eyebrow, fonts, palette, useTheme } from '@/theme';

type Props = {
  city: City;
  at: number; // instant being viewed
  now: number; // real now, to flag offsets that changed while time-travelling
  homeTz: string;
  h24: boolean;
  onRemove: () => void;
};

export function CityRow({ city, at, now, homeTz, h24, onRemove }: Props) {
  const t = useTheme();
  const p = parts(city.tz, at);
  const off = offsetMinutes(city.tz, at);
  const homeOff = offsetMinutes(homeTz, at);
  const dst = dstInfo(city.tz, at);
  const ownChange = off !== offsetMinutes(city.tz, now);
  const gapChange = off - homeOff !== offsetMinutes(city.tz, now) - offsetMinutes(homeTz, now);
  const abbr = zoneAbbr(city.tz, at) ?? utcLabel(off);
  const dd = dayDiff(p, parts(homeTz, at));
  const { time, period } = formatClock(p, h24);

  let tag = dst.active ? `${abbr} · DST` : abbr;
  if (ownChange) tag = `${abbr} · DST ${dst.active ? 'started' : 'ended'}`;
  else if (gapChange) tag = `${abbr} · gap changed`;
  const changed = ownChange || gapChange;
  const tagBg = changed ? palette.coral : dst.active ? palette.sage : 'transparent';
  const rel = relLabel(off - homeOff);

  return (
    <ReanimatedSwipeable
      overshootRight={false}
      renderRightActions={() => (
        <Pressable onPress={onRemove} accessibilityRole="button" style={styles.remove}>
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      )}>
      <View
        accessible
        accessibilityLabel={`${city.name}, ${time} ${period}${dd ? `, ${dd > 0 ? 'tomorrow' : 'yesterday'}` : ''}, ${rel}, ${tag}`}
        accessibilityActions={[{ name: 'delete', label: `Remove ${city.name}` }]}
        onAccessibilityAction={(e) => e.nativeEvent.actionName === 'delete' && onRemove()}
        style={[styles.row, { backgroundColor: t.bg, borderTopColor: t.line }]}>
        <View style={styles.left}>
          <Text numberOfLines={1} style={[styles.name, { color: t.ink }]}>
            {city.name}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.rel, { color: t.muted }]}>{rel}</Text>
            <Text
              style={[
                styles.tag,
                { backgroundColor: tagBg, borderColor: tagBg === 'transparent' ? t.line : tagBg, color: tagBg === 'transparent' ? t.muted : palette.ink },
              ]}>
              {tag}
            </Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text maxFontSizeMultiplier={1.3} style={[styles.time, { color: t.ink }]}>{time}</Text>
          <View style={styles.side}>
            <Text style={[styles.dd, { color: t.muted }]}>{dd > 0 ? `+${dd}` : dd < 0 ? `−${-dd}` : ''}</Text>
            {period ? <Text style={[styles.period, { color: t.ink }]}>{period}</Text> : null}
          </View>
        </View>
      </View>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 72, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, borderTopWidth: 1, paddingHorizontal: 20 },
  left: { flexShrink: 1, gap: 7 },
  name: { fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 2, textTransform: 'uppercase' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rel: { ...eyebrow, fontFamily: fonts.bodySemi, letterSpacing: 0.9 },
  tag: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 0.6, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999, borderWidth: 1.5, overflow: 'hidden' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { fontFamily: fonts.displaySemi, fontSize: 40, letterSpacing: -0.8, fontVariant: ['tabular-nums'] },
  side: { minWidth: 24, gap: 2 },
  dd: { fontFamily: fonts.bodyBold, fontSize: 11, minHeight: 14 },
  period: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 0.7 },
  remove: { width: 96, backgroundColor: palette.coral, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontFamily: fonts.bodyBold, fontSize: 13, color: palette.ink, letterSpacing: 0.5 },
});
