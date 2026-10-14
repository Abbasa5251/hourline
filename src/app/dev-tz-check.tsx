// Dev-only: runs the tz engine checks on the device runtime (Hermes). Reached from Settings in dev builds;
// guarded in _layout so release builds can't open it, even by deep link.
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { runTzSelfCheck } from '@/lib/tz-selfcheck';

export default function TzCheck() {
  if (!__DEV__) return null; // belt and braces: the route is also guarded in _layout
  const results = runTzSelfCheck();
  const failed = results.filter((r) => !r.ok).length;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF6EC' }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }} testID="summary">
          {failed ? `${failed} FAILED` : `ALL ${results.length} PASS`}
        </Text>
        {results.map((r) => (
          <Text key={r.name} style={{ color: r.ok ? '#1B5E20' : '#B71C1C' }}>
            {r.ok ? '✓' : '✗'} {r.name} {r.ok ? '' : `→ ${r.got}`}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
