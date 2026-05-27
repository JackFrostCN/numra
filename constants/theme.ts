/**
 * Numra — Design System & Theme
 * Premium dark-first financial tracker theme with emerald accent.
 */

import { Platform } from 'react-native';

// ── Core Palette ──────────────────────────────

export const Palette = {
  // Background layers (dark → lighter)
  bg: '#0B0F1A',
  bgCard: '#141926',
  bgElevated: '#1C2333',
  bgInput: '#1E2638',

  // Borders & dividers
  border: '#252D3D',
  borderLight: '#2A3349',

  // Text hierarchy
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',

  // Accent — Teal
  accent: '#14B8A6',
  accentLight: '#5EEAD4',
  accentDark: '#0D9488',
  accentMuted: 'rgba(20, 184, 166, 0.15)',

  // Semantic — Financial (shadcn-inspired muted palette)
  income: '#14B8A6',
  incomeBg: 'rgba(20, 184, 166, 0.12)',
  expense: '#F43F5E',
  expenseBg: 'rgba(244, 63, 94, 0.12)',
  loan: '#F59E0B',
  loanBg: 'rgba(245, 158, 11, 0.12)',
  bill: '#8B5CF6',
  billBg: 'rgba(139, 92, 246, 0.12)',

  // Status
  success: '#14B8A6',
  warning: '#F59E0B',
  danger: '#F43F5E',
  info: '#6366F1',

  // Gradients (shadcn-style muted tones)
  gradientIncome: ['#0D9488', '#14B8A6'] as const,
  gradientExpense: ['#E11D48', '#F43F5E'] as const,
  gradientBalance: ['#4338CA', '#6366F1'] as const,
  gradientCard: ['#141926', '#1C2333'] as const,
  gradientAccent: ['#0D9488', '#5EEAD4'] as const,

  // Tab bar
  tabBar: '#0E1322',
  tabBarBorder: '#1C2333',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ── Spacing Scale ─────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// ── Border Radius ─────────────────────────────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

// ── Typography ────────────────────────────────

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// ── Legacy Colors (kept for ThemedText/ThemedView compatibility) ──

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: Palette.textPrimary,
    background: Palette.bg,
    tint: Palette.accent,
    icon: Palette.textMuted,
    tabIconDefault: Palette.textMuted,
    tabIconSelected: Palette.accent,
  },
};
