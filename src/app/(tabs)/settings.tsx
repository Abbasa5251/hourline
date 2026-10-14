import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChevronDownIcon, ChevronUpIcon, CloseIcon, PlusIcon } from '@/components/icons';
import { Button, Segmented } from '@/components/ui';
import { useApp, type Prefs } from '@/state/app-state';
import { eyebrow, fonts, useTheme } from '@/theme';

export default function Settings() {
  const t = useTheme();
  const { home, homeOverride, setHome, cities, moveCity, removeCity, prefs, setPrefs, replayOnboarding } = useApp();

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={[eyebrow, { color: t.muted }]}>Settings</Text>

        <Text accessibilityRole="header" style={[styles.section, { color: t.ink }]}>Home city</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Opens city search"
          onPress={() => router.push({ pathname: '/add-city', params: { mode: 'home' } })}
          style={[styles.card, { borderColor: t.ink, backgroundColor: t.card }]}>
          <Text style={[styles.city, { color: t.ink }]}>{home.name}</Text>
          <Text style={[styles.sub, { color: t.muted }]}>{homeOverride ? 'Set manually · tap to change' : 'From your phone’s time zone · tap to change'}</Text>
        </Pressable>
        {homeOverride ? <Button variant="text" label="Use phone’s time zone" onPress={() => setHome(null)} /> : null}

        <Text accessibilityRole="header" style={[styles.section, { color: t.ink }]}>Your cities</Text>
        <View style={[styles.list, { borderColor: t.ink, backgroundColor: t.card }]}>
          {cities.map((c, i) => (
            <View key={c.id} style={[styles.cityRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.line }]}>
              <View style={{ flex: 1, gap: 1 }}>
                <Text numberOfLines={1} style={[styles.cityName, { color: t.ink }]}>{c.name}</Text>
                {c.country ? <Text numberOfLines={1} style={[styles.sub, { color: t.muted }]}>{c.country}</Text> : null}
              </View>
              <IconButton label={`Move ${c.name} up`} disabled={i === 0} onPress={() => moveCity(c.id, -1)}>
                <ChevronUpIcon color={t.ink} size={18} />
              </IconButton>
              <IconButton label={`Move ${c.name} down`} disabled={i === cities.length - 1} onPress={() => moveCity(c.id, 1)}>
                <ChevronDownIcon color={t.ink} size={18} />
              </IconButton>
              <IconButton label={`Remove ${c.name}`} onPress={() => removeCity(c.id)}>
                <CloseIcon color={t.ink} size={18} />
              </IconButton>
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/add-city', params: { mode: 'add' } })}
            style={[styles.cityRow, cities.length > 0 && { borderTopWidth: 1, borderTopColor: t.line }]}>
            <PlusIcon color={t.ink} size={14} />
            <Text style={[styles.cityName, { color: t.ink }]}>Add city</Text>
          </Pressable>
        </View>

        <Text accessibilityRole="header" style={[styles.section, { color: t.ink }]}>Clock style</Text>
        <Segmented
          label="Clock style"
          value={prefs.h24 ? '24' : '12'}
          onChange={(v) => setPrefs({ h24: v === '24' })}
          options={[
            { value: '12', label: '12-hour' },
            { value: '24', label: '24-hour' },
          ]}
        />

        <Text accessibilityRole="header" style={[styles.section, { color: t.ink }]}>Appearance</Text>
        <Segmented<Prefs['theme']>
          label="Appearance"
          value={prefs.theme}
          onChange={(theme) => setPrefs({ theme })}
          options={[
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
            { value: 'dark', label: 'Dark' },
          ]}
        />

        <View style={{ height: 24 }} />
        <Button variant="text" label="Replay onboarding" onPress={replayOnboarding} />
        {__DEV__ ? <Button variant="text" label="Run time-zone self-check" onPress={() => router.push('/dev-tz-check')} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButton({ label, disabled, onPress, children }: { label: string; disabled?: boolean; onPress: () => void; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.iconBtn, disabled && { opacity: 0.3 }]}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 10 },
  section: { fontFamily: fonts.display, fontSize: 20, marginTop: 14 },
  card: { padding: 16, borderRadius: 20, borderWidth: 2, gap: 2 },
  city: { fontFamily: fonts.bodyBold, fontSize: 17 },
  sub: { fontFamily: fonts.body, fontSize: 13 },
  list: { borderRadius: 20, borderWidth: 2, overflow: 'hidden' },
  cityRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 4, paddingLeft: 16, paddingRight: 6 },
  cityName: { fontFamily: fonts.bodyBold, fontSize: 15 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
