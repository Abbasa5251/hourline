import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';

import { BarsIcon, ClockIcon, SlidersIcon, SwapIcon } from '@/components/icons';
import { palette, useTheme } from '@/theme';

const ICONS = { index: ClockIcon, compare: BarsIcon, convert: SwapIcon, settings: SlidersIcon };

export function PillTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const t = useTheme();
  // Home's dial runs down into the bar, so the bar takes the dial colour there.
  const onHome = state.routes[state.index].name === 'index';

  return (
    <View style={{ backgroundColor: onHome ? t.dial : t.bg, paddingHorizontal: 20, paddingTop: 4, paddingBottom: Math.max(insets.bottom, 12) + 4 }}>
      <View accessibilityRole="tablist" style={styles.pill}>
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const Icon = ICONS[route.name as keyof typeof ICONS] ?? ClockIcon;
          const onPress = () => {
            const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) navigation.navigate(route.name, route.params);
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={descriptors[route.key].options.title}
              onPress={onPress}
              style={[styles.item, focused && styles.itemActive]}>
              <Icon color={focused ? palette.cream : palette.ink} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: 999,
    backgroundColor: palette.apricot,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  item: { width: 56, height: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  itemActive: { backgroundColor: palette.ink },
});
