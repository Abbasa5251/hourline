import { useColorScheme } from 'react-native';

import { useApp } from '@/state/app-state';

// Fixed brand colours (same in light and dark).
export const palette = {
  cream: '#FBF6EC',
  ink: '#12191A',
  apricot: '#F7B955',
  apricotSoft: '#FBD99A',
  sage: '#A8D5B5',
  coral: '#F29479',
  lavender: '#D9CFF5',
  card: '#FFFDF8',
};

const light = {
  dark: false,
  bg: palette.cream,
  ink: palette.ink,
  muted: '#5C6461',
  line: '#E3DACA',
  card: palette.card,
  dial: palette.ink,
  onDial: palette.cream,
  onDialMuted: '#A9B1AE',
  addBg: palette.ink,
  addFg: palette.cream,
  addBorder: palette.ink,
};

const dark: typeof light = {
  dark: true,
  bg: '#10181A',
  ink: '#F4EFE4',
  muted: '#9AA3A0',
  line: '#253033',
  card: '#172124',
  dial: '#F4EFE4',
  onDial: palette.ink,
  onDialMuted: '#5C6461',
  addBg: 'transparent',
  addFg: '#F4EFE4',
  addBorder: '#F4EFE4',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  const system = useColorScheme();
  const { prefs } = useApp();
  const mode = prefs.theme === 'system' ? system : prefs.theme;
  return mode === 'dark' ? dark : light;
}

export const fonts = {
  display: 'BricolageGrotesque_700Bold',
  displaySemi: 'BricolageGrotesque_600SemiBold',
  body: 'DMSans_400Regular',
  bodySemi: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
};

// Small caps label used across screens ("WORLD CLOCK", "FROM").
export const eyebrow = {
  fontFamily: fonts.bodyBold,
  fontSize: 11,
  letterSpacing: 1.8,
  textTransform: 'uppercase' as const,
};
