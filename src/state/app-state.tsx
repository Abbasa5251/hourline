import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCalendars } from 'expo-localization';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { cityForZone, DEFAULT_CITIES, type City } from '@/lib/cities';

export type Prefs = { h24: boolean; theme: 'system' | 'light' | 'dark' };

type Persisted = {
  onboarded: boolean;
  homeOverride: City | null; // null = follow the device time zone
  cities: City[];
  prefs: Prefs;
};

const KEY = 'app-state.v1';
const INITIAL: Persisted = { onboarded: false, homeOverride: null, cities: [], prefs: { h24: false, theme: 'system' } };

type AppValue = Persisted & {
  ready: boolean;
  home: City;
  /** Minutes the user has travelled from now (time travel). Not persisted. */
  shift: number;
  setShift: (minutes: number) => void;
  /** Cities picked on the Convert tab (null = default). Not persisted. */
  convert: { from: City | null; to: City | null };
  setConvert: (patch: Partial<{ from: City | null; to: City | null }>) => void;
  setHome: (city: City | null) => void;
  addCity: (city: City) => void;
  removeCity: (id: string) => void;
  moveCity: (id: string, by: -1 | 1) => void;
  setPrefs: (patch: Partial<Prefs>) => void;
  finishOnboarding: () => void;
  replayOnboarding: () => void;
};

const Ctx = createContext<AppValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Persisted>(INITIAL);
  const [ready, setReady] = useState(false);
  const [shift, setShift] = useState(0);
  const [convert, setConvertState] = useState<{ from: City | null; to: City | null }>({ from: null, to: null });
  const deviceTz = useCalendars()[0]?.timeZone ?? 'UTC';

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState({ ...INITIAL, ...JSON.parse(raw) }))
      .catch(() => {}) // corrupt/unavailable storage → start fresh rather than block launch
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo<AppValue>(() => {
    const update = (fn: (s: Persisted) => Persisted) => setState(fn);
    return {
      ...state,
      ready,
      home: state.homeOverride ?? cityForZone(deviceTz),
      shift,
      setShift,
      convert,
      setConvert: (patch) => setConvertState((c) => ({ ...c, ...patch })),
      setHome: (city) => update((s) => ({ ...s, homeOverride: city })),
      addCity: (city) =>
        update((s) => (s.cities.some((c) => c.id === city.id) ? s : { ...s, cities: [...s.cities, city] })),
      removeCity: (id) => update((s) => ({ ...s, cities: s.cities.filter((c) => c.id !== id) })),
      moveCity: (id, by) =>
        update((s) => {
          const i = s.cities.findIndex((c) => c.id === id);
          const j = i + by;
          if (i < 0 || j < 0 || j >= s.cities.length) return s;
          const cities = [...s.cities];
          [cities[i], cities[j]] = [cities[j], cities[i]];
          return { ...s, cities };
        }),
      setPrefs: (patch) => update((s) => ({ ...s, prefs: { ...s.prefs, ...patch } })),
      finishOnboarding: () =>
        update((s) => ({ ...s, onboarded: true, cities: s.cities.length ? s.cities : DEFAULT_CITIES })),
      replayOnboarding: () => update((s) => ({ ...s, onboarded: false })),
    };
  }, [state, ready, shift, convert, deviceTz]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside AppStateProvider');
  return v;
}
