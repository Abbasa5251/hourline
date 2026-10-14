import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DAY, formatDate, parts, zonedToInstant, type Parts } from '@/lib/tz';
import { fonts, useTheme } from '@/theme';

const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Mon–Sun week containing `at` (in `tz`); tapping a day calls onPick with that day's date. */
export function WeekStrip({ tz, at, onPick }: { tz: string; at: number; onPick: (day: Parts) => void }) {
  const t = useTheme();
  const p = parts(tz, at);
  // Step from local noon so a DST change can never push a day across midnight.
  const noon = zonedToInstant(tz, p.y, p.mo, p.d, 12, 0);
  const days = WD.map((_, i) => noon + (i - p.wd) * DAY);

  return (
    <View style={styles.row}>
      {days.map((d, i) => {
        const dp = parts(tz, d);
        const sel = i === p.wd;
        return (
          <Pressable
            key={i}
            onPress={() => onPick(dp)}
            accessibilityRole="button"
            accessibilityState={{ selected: sel }}
            accessibilityLabel={formatDate(tz, d, { weekday: 'long', month: 'long', day: 'numeric' })}
            style={[styles.day, { borderColor: sel ? t.ink : 'transparent' }]}>
            <Text maxFontSizeMultiplier={1.3} style={[styles.wd, { color: t.muted }]}>{WD[i]}</Text>
            {/* key remounts on selection: Android (Fabric) loses borderRadius when backgroundColor changes after mount. */}
            <View key={sel ? 'on' : 'off'} style={[styles.num, { backgroundColor: sel ? t.ink : 'transparent' }]}>
              <Text maxFontSizeMultiplier={1.2} style={[styles.numText, { color: sel ? t.bg : t.ink }]}>{dp.d}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// Pill keeps the mockup's 48×64 stadium on any screen width; wider phones get more space between days.
const PILL_W = 48;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 16, paddingBottom: 8 },
  day: { width: PILL_W, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 5, borderWidth: 2, borderRadius: PILL_W / 2 },
  wd: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  num: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  numText: { fontFamily: fonts.bodyBold, fontSize: 14 },
});
