import { BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque';
import { DMSans_400Regular, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppStateProvider, useApp } from '@/state/app-state';
import { useTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppStateProvider>
        <RootStack />
      </AppStateProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const { ready, onboarded } = useApp();
  const t = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    DMSans_400Regular,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  // A font failure falls back to system fonts rather than leaving the splash up forever.
  const loaded = ready && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (loaded) SplashScreen.hide();
  }, [loaded]);

  // Hold the splash until the onboarding flag is known, so neither branch flashes.
  if (!loaded) return null;

  return (
    <>
      <StatusBar style={t.dark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.bg } }}>
        <Stack.Protected guard={!onboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboarded}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Screen name="add-city" options={{ presentation: 'modal' }} />
        {/* Dev-only diagnostics: unreachable (even by deep link) in release builds. */}
        <Stack.Protected guard={__DEV__}>
          <Stack.Screen name="dev-tz-check" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
