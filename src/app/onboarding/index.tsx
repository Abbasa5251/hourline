import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Mark } from '@/components/mark';
import { Button } from '@/components/ui';
import { useApp } from '@/state/app-state';
import { fonts, useTheme } from '@/theme';

export default function Welcome() {
  const t = useTheme();
  const { finishOnboarding } = useApp();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]}>
      <View style={styles.hero}>
        <Mark size={168} color={t.ink} />
        <Text accessibilityRole="header" style={[styles.title, { color: t.ink }]}>
          Every time zone,{'\n'}any moment.
        </Text>
        <Text style={[styles.body, { color: t.muted }]}>
          Compare cities, travel forward or back in time, and never get caught out by daylight saving.
        </Text>
      </View>
      <View style={{ gap: 4 }}>
        <Button label="Get started" onPress={() => router.push('/onboarding/home')} />
        <Button label="Skip" variant="text" onPress={finishOnboarding} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 24 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  title: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, textAlign: 'center', letterSpacing: -0.6 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 320 },
});
