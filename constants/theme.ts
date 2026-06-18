/**
 * Numra — Neubrutalism Design System
 * Bold borders, hard shadows, vivid colors, mechanical interactions.
 * Dual-theme: Cream (light) + Deep Purple-Black (dark).
 */

import { Platform } from 'react-native';

// ── Palette Type ──────────────────────────────

export type PaletteType = typeof DarkPalette;

// ── Shared Semantic Colors ────────────────────
// Vivid, high-saturation accent colors for both themes.

const SemanticColors = {
  // Accent — Hot Red
  accent: '#FF6B6B',
  accentLight: '#FF8E8E',
  accentDark: '#E85555',
  accentMuted: 'rgba(255, 107, 107, 0.2)',

  // Semantic — Financial
  income: '#2ECC71',
  incomeBg: 'rgba(46, 204, 113, 0.2)',
  expense: '#FF6B6B',
  expenseBg: 'rgba(255, 107, 107, 0.2)',
  loan: '#FFD93D',
  loanBg: 'rgba(255, 217, 61, 0.2)',
  bill: '#C4B5FD',
  billBg: 'rgba(196, 181, 253, 0.2)',
  bank: '#45B7D1',
  bankBg: 'rgba(69, 183, 209, 0.2)',
  wallet: '#FF8C42',
  walletBg: 'rgba(255, 140, 66, 0.2)',

  // Status
  success: '#2ECC71',
  warning: '#FFD93D',
  danger: '#FF6B6B',
  info: '#45B7D1',

  // Gradients (kept for compatibility but rarely used in neubrutalism)
  gradientIncome: ['#2ECC71', '#27AE60'] as [string, string],
  gradientExpense: ['#FF6B6B', '#E85555'] as [string, string],
  gradientBalance: ['#C4B5FD', '#A78BFA'] as [string, string],
  gradientAccent: ['#FF6B6B', '#FF8E8E'] as [string, string],
  gradientBank: ['#45B7D1', '#38A3BD'] as [string, string],
  gradientWallet: ['#FF8C42', '#E87A35'] as [string, string],

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

// ── Dark Palette ──────────────────────────────

export const DarkPalette = {
  // Background layers
  bg: '#1A1A2E',
  bgCard: '#2D2B55',
  bgElevated: '#3D3A6E',
  bgInput: '#2D2B55',

  // Borders & dividers — cream in dark mode
  border: '#FFFDF5',
  borderLight: 'rgba(255, 253, 245, 0.4)',

  // Text hierarchy
  textPrimary: '#FFFDF5',
  textSecondary: '#D4D2E8',
  textMuted: '#9B98C4',
  textInverse: '#000000',

  // Tab bar
  tabBar: '#1A1A2E',
  tabBarBorder: '#FFFDF5',

  // Card gradient (flat in neubrutalism, but kept for type compat)
  gradientCard: ['#2D2B55', '#2D2B55'] as [string, string],

  // Neubrutalism tokens
  shadowColor: '#FFFDF5',
  borderWidth: 3,

  // Spread shared semantic colors
  ...SemanticColors,
};

// ── Light Palette ──────────────────────────────

export const LightPalette: PaletteType = {
  // Background layers
  bg: '#FFFDF5',
  bgCard: '#FFFFFF',
  bgElevated: '#FFF8E7',
  bgInput: '#FFFDF5',

  // Borders & dividers — black in light mode
  border: '#000000',
  borderLight: 'rgba(0, 0, 0, 0.15)',

  // Text hierarchy
  textPrimary: '#000000',
  textSecondary: '#333333',
  textMuted: '#666666',
  textInverse: '#FFFDF5',

  // Tab bar
  tabBar: '#FFFDF5',
  tabBarBorder: '#000000',

  // Card gradient (flat)
  gradientCard: ['#FFFFFF', '#FFFFFF'] as [string, string],

  // Neubrutalism tokens
  shadowColor: '#000000',
  borderWidth: 4,

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

// ── Border Radius (Neubrutalism: sharp!) ──────

export const Radius = {
  sm: 0,
  md: 0,
  lg: 4,
  xl: 4,
  full: 0,
} as const;

// ── Neubrutalism Constants ────────────────────

export const NB = {
  /** Hard shadow offset (no blur) */
  shadowOffset: 4,
  /** Border width for light mode */
  borderWidthLight: 4,
  /** Border width for dark mode */
  borderWidthDark: 3,
  /** Mechanical press translation */
  pressOffset: 4,
  /** Press animation duration (ms) */
  pressDuration: 80,
} as const;

// ── Typography ────────────────────────────────

export const Fonts = {
  heading: 'SpaceGrotesk-Bold',
  body: 'SpaceGrotesk-Medium',
  bodyRegular: 'SpaceGrotesk-Regular',
  mono: 'JetBrainsMono-Medium',
  monoBold: 'JetBrainsMono-Bold',
};
