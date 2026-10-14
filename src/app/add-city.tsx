import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, CloseIcon, SearchIcon } from '@/components/icons';
import { Pressable } from '@/components/pressable';
import { searchCities, type City } from '@/lib/cities';
import { formatClock, offsetMinutes, parts, relLabel } from '@/lib/tz';
import { useNow } from '@/lib/use-now';
import { useApp } from '@/state/app-state';
import { eyebrow, fonts, useTheme } from '@/theme';

type Mode = 'add' | 'home' | 'from' | 'to';
const TITLES: Record<Mode, [string, string]> = {
  add: ['Add city', 'Search any city'],
  home: ['Home city', 'Where are you based?'],
  from: ['Convert from', 'Pick a city'],
  to: ['Convert to', 'Pick a city'],
};

/** City search. add → saved list, home → home city, from/to → Convert tab. */
export default function AddCity() {
  const t = useTheme();
  const now = useNow();
  const { mode = 'add' } = useLocalSearchParams<{ mode?: Mode }>();
  const { home, cities, addCity, setHome, setConvert, convert, prefs } = useApp();
  const [query, setQuery] = useState('');
  const results = searchCities(query);
  const saved = new Set(cities.map((c) => c.id));

  const choose = (city: City) => {
    if (mode === 'home') setHome(city);
    else if (mode === 'from' || mode === 'to') setConvert({ [mode]: city });
    else addCity(city);
    router.back();
  };
  const current = mode === 'home' ? home.id : mode === 'from' || mode === 'to' ? convert[mode]?.id : undefined;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={styles.header}>
        <View style={{ gap: 4 }}>
          <Text style={[eyebrow, { color: t.muted }]}>{TITLES[mode][0]}</Text>
          <Text style={[styles.title, { color: t.ink }]}>{TITLES[mode][1]}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={() => router.back()} style={[styles.close, { borderColor: t.ink }]}>
          <CloseIcon color={t.ink} size={20} />
        </Pressable>
      </View>

      <View style={[styles.search, { borderColor: t.ink, backgroundColor: t.card }]}>
        <SearchIcon color={t.muted} size={20} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder="City or country"
          placeholderTextColor={t.muted}
          accessibilityLabel="Search cities"
          autoCorrect={false}
          returnKeyType="search"
          style={[styles.input, { color: t.ink }]}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(c) => c.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={[styles.empty, { color: t.muted }]}>No matches for “{query}”.</Text>}
        renderItem={({ item }) => {
          const { time, period } = formatClock(parts(item.tz, now), prefs.h24);
          const isSaved = mode === 'add' ? saved.has(item.id) : item.id === current;
          return (
            <Pressable
              onPress={() => choose(item)}
              disabled={isSaved}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSaved }}
              style={[styles.row, { borderTopColor: t.line }]}>
              <View style={{ flexShrink: 1, gap: 2 }}>
                <Text numberOfLines={1} style={[styles.name, { color: t.ink }]}>{item.name}</Text>
                <Text numberOfLines={1} style={[styles.country, { color: t.muted }]}>
                  {[item.country, relLabel(offsetMinutes(item.tz, now) - offsetMinutes(home.tz, now))].filter(Boolean).join(' · ')}
                </Text>
              </View>
              {isSaved ? (
                <CheckIcon color={t.muted} size={20} />
              ) : (
                <Text style={[styles.time, { color: t.ink }]}>
                  {time} <Text style={styles.period}>{period}</Text>
                </Text>
              )}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 12 },
  title: { fontFamily: fonts.display, fontSize: 24 },
  close: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 12, paddingHorizontal: 14, height: 52, borderRadius: 16, borderWidth: 2 },
  input: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 16, height: '100%' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 60, paddingHorizontal: 20, borderTopWidth: 1 },
  name: { fontFamily: fonts.bodyBold, fontSize: 16 },
  country: { fontFamily: fonts.body, fontSize: 13 },
  time: { fontFamily: fonts.displaySemi, fontSize: 18, fontVariant: ['tabular-nums'] },
  period: { fontFamily: fonts.bodyBold, fontSize: 11 },
  empty: { fontFamily: fonts.body, fontSize: 14, textAlign: 'center', padding: 32 },
});
