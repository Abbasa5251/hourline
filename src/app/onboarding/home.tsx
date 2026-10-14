import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { formatClock, offsetMinutes, parts, utcLabel, zoneAbbr } from '@/lib/tz';
import { useNow } from '@/lib/use-now';
import { useApp } from '@/state/app-state';
import { eyebrow, fonts, useTheme } from '@/theme';

export default function HomeStep() {
  const t = useTheme();
  const now = useNow();
  const { home, homeOverride, prefs } = useApp();
  const { time, period } = formatClock(parts(home.tz, now), prefs.h24);
  const abbr = zoneAbbr(home.tz, now) ?? utcLabel(offsetMinutes(home.tz, now));

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]}>
      <View style={{ flex: 1, gap: 12 }}>
        <Text style={[eyebrow, { color: t.muted }]}>Step 1 of 2</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: t.ink }]}>Your home city</Text>
        <Text style={[styles.body, { color: t.muted }]}>
          {homeOverride ? 'Your chosen home city.' : 'Picked from your phone’s time zone.'} Every other city is shown relative to it.
        </Text>

        <View style={[styles.card, { backgroundColor: t.card, borderColor: t.ink }]}>
          <Text style={[styles.city, { color: t.ink }]}>{home.name}</Text>
          {home.country ? <Text style={[styles.country, { color: t.muted }]}>{home.country}</Text> : null}
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: t.ink }]}>{time}</Text>
            <Text style={[styles.period, { color: t.ink }]}>{period}</Text>
            <Text style={[styles.abbr, { color: t.muted }]}>{abbr}</Text>
          </View>
        </View>
        <Button label="Change city" variant="text" onPress={() => router.push({ pathname: '/add-city', params: { mode: 'home' } })} />
      </View>
      <Button label="Continue" onPress={() => router.push('/onboarding/cities')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24 },
  title: { fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.5 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  card: { marginTop: 12, padding: 20, borderRadius: 24, borderWidth: 2, gap: 2 },
  city: { fontFamily: fonts.display, fontSize: 28 },
  country: { fontFamily: fonts.body, fontSize: 15 },
  timeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 10 },
  time: { fontFamily: fonts.display, fontSize: 44, letterSpacing: -1, fontVariant: ['tabular-nums'] },
  period: { fontFamily: fonts.bodyBold, fontSize: 14 },
  abbr: { fontFamily: fonts.bodySemi, fontSize: 13, marginLeft: 4 },
});
