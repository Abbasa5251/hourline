import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { eyebrow, fonts, useTheme } from '@/theme';

/** Full-width ink pill button (primary) or text button (secondary). */
export function Button({ label, onPress, variant = 'primary' }: { label: string; onPress: () => void; variant?: 'primary' | 'text' }) {
  const t = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.button, primary && { backgroundColor: t.ink }, pressed && { opacity: 0.8 }]}>
      <Text style={[styles.buttonText, { color: primary ? t.bg : t.ink }]}>{label}</Text>
    </Pressable>
  );
}

/** Two-or-more option segmented control. */
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  const t = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.seg, { borderColor: t.ink }]}>
      {options.map((o) => {
        const sel = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ checked: sel }}
            onPress={() => onChange(o.value)}
            style={[styles.segItem, sel && { backgroundColor: t.ink }]}>
            <Text style={[styles.segText, { color: sel ? t.bg : t.ink }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Screen scaffold for tabs not built yet. */
export function Placeholder({ eyebrow: label, title, body }: { eyebrow: string; title: string; body: string }) {
  const t = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: t.bg, padding: 20, gap: 8 }}>
      <Text style={[eyebrow, { color: t.muted }]}>{label}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 24, color: t.ink }}>{title}</Text>
      <Text style={{ fontFamily: fonts.body, fontSize: 15, color: t.muted, lineHeight: 22 }}>{body}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', alignSelf: 'stretch' },
  buttonText: { fontFamily: fonts.bodyBold, fontSize: 15, letterSpacing: 1.5, textTransform: 'uppercase' },
  seg: { flexDirection: 'row', borderWidth: 2, borderRadius: 999, padding: 4, gap: 4 },
  segItem: { flex: 1, minHeight: 40, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  segText: { fontFamily: fonts.bodyBold, fontSize: 13 },
});
