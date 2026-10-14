import { Tabs } from 'expo-router/js-tabs';

import { PillTabBar } from '@/components/pill-tab-bar';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs tabBar={(props) => <PillTabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Clocks' }} />
      <Tabs.Screen name="compare" options={{ title: 'Compare' }} />
      <Tabs.Screen name="convert" options={{ title: 'Convert' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
