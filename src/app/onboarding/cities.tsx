import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CheckIcon, SearchIcon } from '@/components/icons';
import { Pressable } from '@/components/pressable';
import { Button, Segmented } from '@/components/ui';
import { SUGGESTED } from '@/lib/cities';
import { useApp } from '@/state/app-state';
import { eyebrow, fonts, useTheme } from '@/theme';

export default function CitiesStep() {
  const t = useTheme();
  const { cities, addCity, removeCity, prefs, setPrefs, finishOnboarding, home } = useApp();
  const saved = new Set(cities.map((c) => c.id));
  // Suggestions first, then anything picked through search.
  const chips = [...SUGGESTED.filter((c) => c.id !== home.id), ...cities.filter((c) => !SUGGESTED.some((s) => s.id === c.id))];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        <Text style={[eyebrow, { color: t.muted }]}>Step 2 of 2</Text>
        <Text accessibilityRole="header" style={[styles.title, { color: t.ink }]}>Pick a few cities</Text>
        <Text style={[styles.body, { color: t.muted }]}>You can add, remove or reorder them any time.</Text>

        <View style={styles.chips}>
          {chips.map((c) => {
            const on = saved.has(c.id);
            return (
              <Pressable
                key={c.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => (on ? removeCity(c.id) : addCity(c))}
                style={[styles.chip, { borderColor: t.ink, backgroundColor: on ? t.ink : 'transparent' }]}>
                {on ? <CheckIcon color={t.bg} size={14} /> : null}
                <Text style={[styles.chipText, { color: on ? t.bg : t.ink }]}>{c.name}</Text>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/add-city', params: { mode: 'add' } })}
            style={[styles.chip, { borderColor: t.muted, borderStyle: 'dashed' }]}>
            <SearchIcon color={t.ink} size={14} />
            <Text style={[styles.chipText, { color: t.ink }]}>Search more</Text>
          </Pressable>
        </View>

        <Text style={[eyebrow, { color: t.muted, marginTop: 20 }]}>Clock style</Text>
        <Segmented
          label="Clock style"
          value={prefs.h24 ? '24' : '12'}
          onChange={(v) => setPrefs({ h24: v === '24' })}
          options={[
            { value: '12', label: '12-hour · 4:21 PM' },
            { value: '24', label: '24-hour · 16:21' },
          ]}
        />
      </ScrollView>
      <Button label={cities.length ? 'Done' : 'Skip for now'} onPress={finishOnboarding} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24 },
  title: { fontFamily: fonts.display, fontSize: 32, letterSpacing: -0.5 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, borderRadius: 22, borderWidth: 2 },
  chipText: { fontFamily: fonts.bodyBold, fontSize: 14 },
});
