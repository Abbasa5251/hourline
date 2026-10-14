import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// Android: performAndroidHapticsAsync uses the system's own haptic constants (like native buttons) instead of
// simulating them with the Vibrator, which Expo advises against. iOS: the Taptic Engine.
const android = (type: Haptics.AndroidHaptics) => Haptics.performAndroidHapticsAsync(type);
const ignore = () => {};

/** Light tap for buttons, tabs and list items. */
export function tap() {
  (Platform.OS === 'android' ? android(Haptics.AndroidHaptics.Virtual_Key) : Haptics.selectionAsync()).catch(ignore);
}

/** Lighter tick for continuous changes: each dial step, each week swiped. */
export function tick() {
  (Platform.OS === 'android' ? android(Haptics.AndroidHaptics.Segment_Tick) : Haptics.selectionAsync()).catch(ignore);
}
