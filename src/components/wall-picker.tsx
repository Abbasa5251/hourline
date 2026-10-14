import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui';
import type { Wall } from '@/lib/tz';
import { useApp } from '@/state/app-state';
import { useTheme } from '@/theme';

type Mode = 'date' | 'time';
type Request = { mode: Mode; value: Wall; onPick: (w: Wall) => void };

// The picker runs in UTC so it only edits wall-clock fields: no device-DST shifting, and our engine
// stays the single place that maps wall time → instant (and can flag times skipped by DST).
const toDate = (w: Wall) => new Date(Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi));
const toWall = (d: Date): Wall => ({ y: d.getUTCFullYear(), mo: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes() });

/** Native date/time picker for wall-clock values. Render `element` once in the screen. */
export function useWallPicker() {
  const t = useTheme();
  const { prefs } = useApp();
  const [req, setReq] = useState<Request | null>(null);
  const [draft, setDraft] = useState<Wall | null>(null);

  const open = (mode: Mode, value: Wall, onPick: (w: Wall) => void) => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: toDate(value),
        mode,
        timeZoneName: 'UTC',
        is24Hour: prefs.h24,
        onValueChange: (_, d) => onPick(toWall(d)),
      });
    } else {
      setDraft(value);
      setReq({ mode, value, onPick });
    }
  };

  const close = () => setReq(null);
  const element =
    req && draft ? (
      <Modal transparent animationType="fade" onRequestClose={close}>
        <Pressable accessibilityLabel="Close picker" style={styles.backdrop} onPress={close} />
        <View style={[styles.sheet, { backgroundColor: t.card, borderColor: t.ink }]}>
          <DateTimePicker
            value={toDate(draft)}
            mode={req.mode}
            display={req.mode === 'date' ? 'inline' : 'spinner'}
            timeZoneName="UTC"
            themeVariant={t.dark ? 'dark' : 'light'}
            accentColor={t.ink}
            onValueChange={(_, d) => setDraft(toWall(d))}
          />
          <Button
            label="Done"
            onPress={() => {
              req.onPick(draft);
              close();
            }}
          />
        </View>
      </Modal>
    ) : null;

  return { open, element };
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(18,25,26,0.4)' },
  sheet: { position: 'absolute', left: 16, right: 16, bottom: 40, padding: 16, borderRadius: 24, borderWidth: 2, gap: 12 },
});
