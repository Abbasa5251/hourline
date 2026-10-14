import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Circle, G, Line } from 'react-native-svg';

import { MIN } from '@/lib/tz';
import { fonts, palette, useTheme } from '@/theme';

const HEIGHT = 190;
const STEP_MIN = 15;
const PX_PER_STEP = 8;
// 6° apart, major every 18°. Rotation wraps at 18° so the pattern always covers the visible arc (±~35°).
const TICKS = Array.from({ length: 23 }, (_, i) => -66 + i * 6);

type Props = {
  shift: number; // minutes from now
  now: number;
  onChange: (shift: number) => void;
  label: string;
  sublabel: string;
  valueText: string; // spoken by screen readers, e.g. "4:21 PM, Wednesday"
};

/** Bottom arc: drag left = forward in time, right = back. Snaps to quarter hours. */
export function Dial({ shift, now, onChange, label, sublabel, valueText }: Props) {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const r = Math.max(330, width * 0.85);
  const cx = width / 2;
  const cy = r + 50; // keeps the arc's top at y=50 on any width
  const [dragStart, setDragStart] = useState<number | null>(null);

  const snapTo = (minutes: number) => {
    const target = now + minutes * MIN;
    const snapped = Math.round(target / (STEP_MIN * MIN)) * STEP_MIN * MIN;
    return Math.round((snapped - now) / MIN);
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .onStart(() => setDragStart(shift))
    .onUpdate((e) => {
      const next = snapTo((dragStart ?? shift) + Math.round(-e.translationX / PX_PER_STEP) * STEP_MIN);
      if (next === shift) return;
      onChange(next);
      Haptics.selectionAsync();
    })
    .onFinalize(() => setDragStart(null));

  return (
    <GestureDetector gesture={pan}>
      <View style={{ height: HEIGHT }}>
        <Svg width={width} height={HEIGHT} style={StyleSheet.absoluteFill} pointerEvents="none">
          <G rotation={-((shift / 60) * 2) % 18} origin={`${cx}, ${cy}`} stroke={t.muted} strokeWidth={2} strokeLinecap="round">
            {TICKS.map((a) => (
              <Line key={a} x1={cx} y1={cy - r - 8} x2={cx} y2={cy - r - (a % 18 === 0 ? 30 : 22)} transform={`rotate(${a} ${cx} ${cy})`} />
            ))}
          </G>
          <Circle cx={cx} cy={cy} r={r} fill={t.dial} />
          <Circle cx={cx} cy={cy} r={r - 18} fill="none" stroke={t.onDialMuted} strokeWidth={1.5} strokeDasharray="1 7" strokeLinecap="round" />
          <Line x1={cx} y1={56} x2={cx} y2={70} stroke={palette.apricot} strokeWidth={3} strokeLinecap="round" />
        </Svg>

        <View style={styles.overlay}>
          {/* The adjustable element is the labels only: on the container it would swallow the buttons below. */}
          <View
            style={styles.labels}
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={`Time dial, ${label}`}
            accessibilityHint="Swipe up or down to move 15 minutes"
            accessibilityValue={{ text: valueText }}
            accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={(e) => onChange(snapTo(shift + (e.nativeEvent.actionName === 'increment' ? STEP_MIN : -STEP_MIN)))}>
            <Text maxFontSizeMultiplier={1.3} style={[styles.label, { color: t.onDial }]}>{label}</Text>
            <Text maxFontSizeMultiplier={1.3} style={[styles.sublabel, { color: t.onDialMuted }]}>{sublabel}</Text>
          </View>
          <View style={styles.buttons}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back one hour" onPress={() => onChange(shift - 60)} style={[styles.round, { borderColor: t.onDialMuted }]}>
              <Text maxFontSizeMultiplier={1.2} style={[styles.roundText, { color: t.onDial }]}>−1h</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Back to now" onPress={() => onChange(0)} style={[styles.now, { backgroundColor: t.onDial }]}>
              <Text maxFontSizeMultiplier={1.2} style={[styles.nowText, { color: t.dial }]}>NOW</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Forward one hour" onPress={() => onChange(shift + 60)} style={[styles.round, { borderColor: t.onDialMuted }]}>
              <Text maxFontSizeMultiplier={1.2} style={[styles.roundText, { color: t.onDial }]}>+1h</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', left: 0, right: 0, top: 80, alignItems: 'center', gap: 12 },
  labels: { alignItems: 'center', gap: 4 },
  label: { fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, textTransform: 'uppercase' },
  sublabel: { fontFamily: fonts.bodySemi, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase' },
  buttons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  roundText: { fontFamily: fonts.bodyBold, fontSize: 12 },
  now: { height: 44, paddingHorizontal: 26, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  nowText: { fontFamily: fonts.bodyBold, fontSize: 13, letterSpacing: 2 },
});
