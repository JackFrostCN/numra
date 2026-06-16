/**
 * Numra — Design System & Theme
 * Dual-theme financial tracker: dark + light (system default).
 */

import { Platform } from 'react-native';

// ── Palette Type ──────────────────────────────

export type PaletteType = typeof DarkPalette;

// ── Shared Semantic Colors ────────────────────
// These are identical in both themes — they're designed
// to be legible on both light and dark backgrounds.

const SemanticColors = {
  // Accent — Teal
  accent: '#14B8A6',
  accentLight: '#5EEAD4',
  accentDark: '#0D9488',
  accentMuted: 'rgba(20, 184, 166, 0.15)',

  // Semantic — Financial
  income: '#14B8A6',
  incomeBg: 'rgba(20, 184, 166, 0.12)',
  expense: '#F43F5E',
  expenseBg: 'rgba(244, 63, 94, 0.12)',
  loan: '#F59E0B',
  loanBg: 'rgba(245, 158, 11, 0.12)',
  bill: '#8B5CF6',
  billBg: 'rgba(139, 92, 246, 0.12)',
  bank: '#3B82F6',
  bankBg: 'rgba(59, 130, 246, 0.12)',
  wallet: '#F97316',
  walletBg: 'rgba(249, 115, 22, 0.12)',

  // Status
  success: '#14B8A6',
  warning: '#F59E0B',
  danger: '#F43F5E',
  info: '#6366F1',

  // Gradients
  gradientIncome: ['#0D9488', '#14B8A6'] as [string, string],
  gradientExpense: ['#E11D48', '#F43F5E'] as [string, string],
  gradientBalance: ['#4338CA', '#6366F1'] as [string, string],
  gradientAccent: ['#0D9488', '#5EEAD4'] as [string, string],
  gradientBank: ['#2563EB', '#3B82F6'] as [string, string],
  gradientWallet: ['#EA580C', '#F97316'] as [string, string],

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ── Dark Palette ──────────────────────────────

export const DarkPalette = {
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

  // Tab bar
  tabBar: '#0E1322',
  tabBarBorder: '#1C2333',

  // Card gradient (for LinearGradient cards)
  gradientCard: ['#141926', '#1C2333'] as [string, string],

  // Spread shared semantic colors
  ...SemanticColors,
};

// ── Light Palette (from design.md "Trustworthy Modernism") ──

export const LightPalette: PaletteType = {
  // Background layers (light → slightly darker)
  bg: '#F8FAFC',
  bgCard: '#FFFFFF',
  bgElevated: '#F1F5F9',
  bgInput: '#F1F5F9',

  // Borders & dividers
  border: '#E2E8F0',
  borderLight: '#F1F5F9',

  // Text hierarchy
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#F1F5F9',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',

  // Card gradient
  gradientCard: ['#FFFFFF', '#F8FAFC'] as [string, string],

  // Spread shared semantic colors
  ...SemanticColors,
};

// ── Legacy alias (for any remaining direct imports during migration) ──
export const Palette = DarkPalette;

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
