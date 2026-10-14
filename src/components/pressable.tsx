import { Pressable as RNPressable, type PressableProps } from 'react-native';

import { tap } from '@/lib/haptics';

/** react-native's Pressable plus a light haptic tap on every press. Use it for anything tappable. */
export function Pressable({ onPress, ...rest }: PressableProps) {
  return (
    <RNPressable
      {...rest}
      onPress={
        onPress &&
        ((e) => {
          tap();
          onPress(e);
        })
      }
    />
  );
}
