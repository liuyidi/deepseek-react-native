/**
 * App color tokens for light / dark mode.
 * Use `useAppTheme()` or `useThemeColor()` — avoid hardcoded `#fff` on surfaces.
 */

const tintColorLight = '#1063FD';
const tintColorDark = '#5E9AFF';

export const Colors = {
  light: {
    text: '#1C1C1E',
    heading: '#000000',
    textSecondary: '#6E6E73',
    background: '#EFEEF6',
    card: '#FFFFFF',
    border: '#DCDCE2',
    tint: tintColorLight,
    icon: '#6E6E73',
    tabIconDefault: '#6E6E73',
    tabIconSelected: tintColorLight,
    link: tintColorLight,
  },
  dark: {
    text: '#EBEBF5',
    heading: '#FFFFFF',
    textSecondary: '#98989D',
    background: '#000000',
    card: '#1C1C1E',
    border: '#38383A',
    tint: tintColorDark,
    icon: '#98989D',
    tabIconDefault: '#98989D',
    tabIconSelected: '#FFFFFF',
    link: tintColorDark,
  },
  /** Brand / static accents (theme-independent) */
  primary: '#1063FD',
  muted: '#3A5A92',
  gray: '#6E6E73',
  lightGray: '#DCDCE2',
  green: '#4FEE57',
  lightGreen: '#DBFFCB',
  red: '#EF0827',
  yellow: '#FCC70B',
} as const;

export type AppColorScheme = 'light' | 'dark';
export type ThemeColors = (typeof Colors)[AppColorScheme];
