import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CityRow } from '@/components/city-row';
import { Dial } from '@/components/dial';
import { PlusIcon } from '@/components/icons';
import { WeekStrip } from '@/components/week-strip';
import { dstInfo, formatClock, formatDate, MIN, offsetMinutes, parts, utcLabel, zoneAbbr, zonedToInstant } from '@/lib/tz';
import { useNow } from '@/lib/use-now';
import { useApp } from '@/state/app-state';
import { eyebrow, fonts, palette, useTheme } from '@/theme';

function describeShift(shift: number) {
  if (shift === 0) return 'Live now';
  const a = Math.abs(shift);
  const d = Math.floor(a / 1440);
  const h = Math.floor((a % 1440) / 60);
  const m = a % 60;
  const bits = [d && `${d} ${d === 1 ? 'day' : 'days'}`, h && `${h} ${h === 1 ? 'hr' : 'hrs'}`, m && `${m} min`].filter(Boolean);
  return `${bits.join(' ')} ${shift > 0 ? 'ahead of now' : 'before now'}`;
}

export default function Home() {
  const t = useTheme();
  const now = useNow();
  const { home, cities, shift, setShift, removeCity, prefs } = useApp();
  const at = now + shift * MIN;
  const hp = parts(home.tz, at);
  const { time, period } = formatClock(hp, prefs.h24);
  const abbr = zoneAbbr(home.tz, at) ?? utcLabel(offsetMinutes(home.tz, at));
  const dateLong = formatDate(home.tz, at, { weekday: 'long', month: 'short', day: 'numeric' });

  // Jump to another day at the same wall-clock time (correct across DST changes).
  const pickDay = (d: { y: number; mo: number; d: number }) =>
    setShift(Math.round((zonedToInstant(home.tz, d.y, d.mo, d.d, hp.h, hp.mi) - now) / MIN));

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: t.bg }]}>
      <View style={styles.header}>
        <View style={{ gap: 4 }}>
          <Text style={[eyebrow, { color: t.muted }]}>World clock</Text>
          <Text accessibilityRole="header" style={[styles.date, { color: t.ink }]}>{dateLong}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add city"
          onPress={() => router.push({ pathname: '/add-city', params: { mode: 'add' } })}
          style={[styles.add, { backgroundColor: t.addBg, borderColor: t.addBorder }]}>
          <PlusIcon color={t.addFg} size={14} />
          <Text style={[styles.addText, { color: t.addFg }]}>ADD</Text>
        </Pressable>
      </View>

      <WeekStrip tz={home.tz} at={at} onPick={pickDay} />

      <FlatList
        style={{ flex: 1 }}
        data={cities}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <CityRow city={item} at={at} now={now} homeTz={home.tz} h24={prefs.h24} onRemove={() => removeCity(item.id)} />
        )}
        ListEmptyComponent={<Text style={[styles.empty, { color: t.muted }]}>No cities yet. Tap ADD to pick some.</Text>}
      />

      <View style={styles.homeBlock}>
        <View style={styles.homeTime}>
          <Text style={[styles.big, { color: t.ink }]}>{time}</Text>
          {period ? <Text style={[styles.bigPeriod, { color: t.ink }]}>{period}</Text> : null}
        </View>
        <Text style={[styles.chip, { backgroundColor: shift === 0 ? palette.sage : palette.coral }]}>{describeShift(shift)}</Text>
      </View>

      <Dial
        shift={shift}
        now={now}
        onChange={setShift}
        label={home.name}
        sublabel={`${shift === 0 ? 'Current location' : 'Home'} · ${abbr}${dstInfo(home.tz, at).active ? ' · DST' : ''}`}
        valueText={`${time} ${period}, ${dateLong}`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 12 },
  date: { fontFamily: fonts.display, fontSize: 24, letterSpacing: -0.2 },
  add: { height: 44, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 22, borderWidth: 2 },
  addText: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 1.7 },
  empty: { fontFamily: fonts.body, fontSize: 14, textAlign: 'center', padding: 32 },
  homeBlock: { alignItems: 'center', gap: 8, paddingTop: 4 },
  homeTime: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  big: { fontFamily: fonts.display, fontSize: 52, letterSpacing: -1.5, fontVariant: ['tabular-nums'] },
  bigPeriod: { fontFamily: fonts.bodyBold, fontSize: 14, letterSpacing: 0.8 },
  chip: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', color: palette.ink },
});
