/**
 * AFRILOVE WORLD — Design System (React Native port)
 *
 * Faithful port of the Flutter design tokens (lib/core/ui.dart + DESIGN_SYSTEM.md).
 * Warm editorial palette: Espresso + Camel Gold on warm Ivory.
 * Brand font: Gotham → fallback Inter → currently rendered with Satoshi.
 */

export const Colors = {
  // ── Brand core ──────────────────────────────────────────────
  primary: '#2C1B14', // Espresso — primary buttons, headings, key text
  primary800: '#3A271D', // hover / pressed primary
  secondary: '#D4A373', // Camel Gold — accents, focus, premium, links
  secondaryDeep: '#B07D4F', // gold pressed / gradient end
  goldLight: '#E9C893', // gold gradient start / premium shine

  // ── Surfaces / backgrounds ──────────────────────────────────
  background: '#F8F4EE', // warm ivory scaffold
  card: '#FFFFFF',
  surface: '#FFFFFF',

  // ── Text ────────────────────────────────────────────────────
  textPrimary: '#2C1B14',
  textSecondary: '#6B5D54',
  textMuted: '#9A8E84',
  white: '#FFFFFF',

  // ── Borders / greys ─────────────────────────────────────────
  border: '#ECE5DD',
  greyLight: '#ECE5DD',
  greyDark: '#9A8E84',

  // ── Semantic ────────────────────────────────────────────────
  success: '#2E9E6B',
  error: '#D0584E',
  warning: '#E0A042',

  // ── Dark mode ───────────────────────────────────────────────
  dark: {
    background: '#16100C',
    surface: '#221A15',
    card: '#221A15',
    border: '#3A2E26',
    textPrimary: '#F8F4EE',
    textSecondary: '#D9CFC6',
    primaryAction: '#D4A373',
  },
} as const;

// 8-pt soft spacing grid
export const Spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  screen: 20, // screen horizontal padding
} as const;

// Corner radius — brand default for cards/sheets = xl (24)
export const Radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

// Soft, brand-tinted, low-opacity elevations
export const Shadows = {
  soft: {
    shadowColor: '#2C1B14',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  card: {
    shadowColor: '#2C1B14',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  elevated: {
    shadowColor: '#2C1B14',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 16 },
    elevation: 12,
  },
} as const;

// Brand gradients (use with expo-linear-gradient)
export const Gradients = {
  overlay: ['transparent', 'rgba(44,27,20,0.55)', '#2C1B14'] as const,
  gold: ['#E9C893', '#D4A373', '#B07D4F'] as const,
  brand: ['#3A271D', '#2C1B14'] as const,
};

// Bundled font families (Satoshi). Swap for Gotham/Inter by replacing files.
export const Fonts = {
  regular: 'Satoshi-Regular',
  medium: 'Satoshi-Medium',
  bold: 'Satoshi-Bold',
  black: 'Satoshi-Black',
} as const;

// Editorial type scale (size / weight / tracking)
export const Type = {
  display: { fontFamily: Fonts.bold, fontSize: 56, letterSpacing: -0.5 },
  h1: { fontFamily: Fonts.bold, fontSize: 34, letterSpacing: -0.4 },
  h2: { fontFamily: Fonts.bold, fontSize: 28, letterSpacing: -0.3 },
  h3: { fontFamily: Fonts.bold, fontSize: 22, letterSpacing: -0.2 },
  bodyL: { fontFamily: Fonts.medium, fontSize: 17, letterSpacing: 0 },
  bodyM: { fontFamily: Fonts.medium, fontSize: 15, letterSpacing: 0 },
  bodyS: { fontFamily: Fonts.medium, fontSize: 13, letterSpacing: 0.1 },
  label: { fontFamily: Fonts.medium, fontSize: 13, letterSpacing: 0.2 },
  caption: { fontFamily: Fonts.regular, fontSize: 11, letterSpacing: 0.3 },
  overline: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2 },
  button: { fontFamily: Fonts.bold, fontSize: 16, letterSpacing: 0.3 },
} as const;

export type ThemeColors = typeof Colors;
