/**
 * Numra — Clean Minimal Design System
 * Soft shadows, generous whitespace, rounded corners, warm coral accent.
 * Dual-theme: Light (grey base) + Dark (dark grey base).
 */

import { Platform } from 'react-native';

// ── Palette Type ──────────────────────────────

export type PaletteType = typeof DarkPalette;

// ── Shared Semantic Colors ────────────────────

const SemanticColors = {
  // Accent — Coral
  accent: '#F07B6B',
  accentLight: '#F49B8E',
  accentDark: '#E06252',
  accentMuted: 'rgba(240, 123, 107, 0.2)',

  // Semantic — Financial
  income: '#2ECC71',
  incomeBg: 'rgba(46, 204, 113, 0.15)',
  expense: '#F07B6B',
  expenseBg: 'rgba(240, 123, 107, 0.15)',
  loan: '#F5C242',
  loanBg: 'rgba(245, 194, 66, 0.15)',
  bill: '#8B7EE6',
  billBg: 'rgba(139, 126, 230, 0.15)',
  bank: '#7DD5D8',
  bankBg: 'rgba(125, 213, 216, 0.15)',
  wallet: '#F4845F',
  walletBg: 'rgba(244, 132, 95, 0.15)',

  // Status
  success: '#2ECC71',
  warning: '#F5C242',
  danger: '#F07B6B',
  info: '#7DD5D8',

  // Gradients (kept for compatibility)
  gradientIncome: ['#2ECC71', '#27AE60'] as [string, string],
  gradientExpense: ['#F07B6B', '#E06252'] as [string, string],
  gradientBalance: ['#8B7EE6', '#7264D4'] as [string, string],
  gradientAccent: ['#F07B6B', '#F49B8E'] as [string, string],
  gradientBank: ['#7DD5D8', '#62BFC2'] as [string, string],
  gradientWallet: ['#F4845F', '#E8724D'] as [string, string],

  // Chart Colors (Category Breakdown)
  chartColors: ['#7DD5D8', '#F07B6B', '#F5C242', '#2E7D5E', '#8B7EE6', '#F4845F', '#4ECDC4', '#FF6F91'],

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ── Dark Palette ──────────────────────────────

export const DarkPalette = {
  // Background layers
  bg: '#1A1D23',
  bgCard: '#242830',
  bgElevated: '#2A2F38',
  bgInput: '#242830',

  // Borders & dividers
  border: '#333840',
  borderLight: 'rgba(255, 255, 255, 0.1)',

  // Text hierarchy
  textPrimary: '#F0F2F5',
  textSecondary: '#A0ABC0',
  textMuted: '#718096',
  textInverse: '#1C3557',

  // Tab bar
  tabBar: '#1A1D23',
  tabBarBorder: '#333840',

  // Card gradient (flat)
  gradientCard: ['#242830', '#242830'] as [string, string],

  // Design tokens
  shadowColor: '#000000',
  borderWidth: 1,

  // Spread shared semantic colors
  ...SemanticColors,
};

// ── Light Palette ──────────────────────────────

export const LightPalette: PaletteType = {
  // Background layers
  bg: '#F5F6FA',
  bgCard: '#FFFFFF',
  bgElevated: '#F8F9FA',
  bgInput: '#FFFFFF',

  // Borders & dividers
  border: '#E8ECF1',
  borderLight: 'rgba(0, 0, 0, 0.05)',

  // Text hierarchy
  textPrimary: '#1C3557',
  textSecondary: '#5A6B7F',
  textMuted: '#8A95A5',
  textInverse: '#FFFFFF',

  // Tab bar
  tabBar: '#FFFFFF',
  tabBarBorder: '#E8ECF1',

  // Card gradient (flat)
  gradientCard: ['#FFFFFF', '#FFFFFF'] as [string, string],

  // Design tokens
  shadowColor: '#1C3557', // Use navy for softer shadows
  borderWidth: 1,

  // Spread shared semantic colors
  ...SemanticColors,
};

// ── Legacy alias ──────────────────────────────
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

// ── Border Radius (Clean minimal: rounded) ──────

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ── Soft Shadows ────────────────────

export const Shadows = {
  sm: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
};

// ── Legacy NB constants for compat (to be removed from usages) ──
export const NB = {
  shadowOffset: 0, // Disable
  borderWidthLight: 1,
  borderWidthDark: 1,
  pressOffset: 0, // Disable translation
  pressDuration: 150,
} as const;

// ── Typography ────────────────────────────────

export const Fonts = {
  heading: 'Nunito_700Bold',
  body: 'Nunito_600SemiBold',
  bodyRegular: 'Nunito_400Regular',
  mono: 'Nunito_700Bold', // Use bold for numbers
  monoMedium: 'Nunito_500Medium',
};
