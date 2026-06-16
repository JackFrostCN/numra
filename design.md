---
name: Fiscal Harmony
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#400010'
  on-tertiary-container: '#da586c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffdadc'
  tertiary-fixed-dim: '#ffb2b9'
  on-tertiary-fixed: '#400010'
  on-tertiary-fixed-variant: '#891933'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-display:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  margin-mobile: 20px
  gutter-mobile: 12px
---

## Brand & Style

This design system centers on **Trustworthy Modernism**. It is tailored for individuals seeking financial clarity through a lens of professional stability and approachable elegance. The design balances the rigor of high-finance with the accessibility of consumer technology.

The aesthetic follows a **Modern Corporate** style with leanings toward **Minimalism**. It prioritizes high-quality typography and generous whitespace to reduce cognitive load during complex financial tasks. Visual hierarchy is established through tonal layering and refined depth, ensuring the user feels in control, secure, and informed.

## Colors

The palette is anchored by **Deep Navy** (`#0F172A`), providing a sense of institutional security and authority. **Emerald Green** (`#10B981`) is reserved strictly for positive growth, income, and "on-track" statuses, creating a psychological association between the color and financial health. **Subtle Coral** (`#FB7185`) is used for expenses and alerts, offering a softer, less aggressive alternative to standard red.

Backgrounds utilize a tiered grayscale approach (Neutral) to separate the canvas from surface containers, while subtle blue-tints in the grays maintain brand cohesion.

## Typography

The typography system is split into three functional roles:
- **Manrope** is used for headlines and primary data displays (balances, totals). Its geometric yet warm structure feels modern and precise.
- **Hanken Grotesk** handles all body copy and descriptions, chosen for its exceptional legibility and sharp, professional terminals.
- **JetBrains Mono** is used sparingly for transaction IDs, tabular data, and small numerical labels to reinforce the technical accuracy of the tracking.

For mobile responsiveness, `headline-lg` should scale to 28px on devices smaller than 375px wide.

## Layout & Spacing

This design system utilizes a **Fluid Grid** model based on a 4px baseline. On mobile, the layout uses a 4-column structure with 20px side margins to provide a breathable, premium frame. 

Vertical rhythm is strictly enforced using increments of 8px. Use `lg` (24px) for spacing between distinct card sections and `md` (16px) for internal padding within components. Generous whitespace is a requirement; avoid cramming data points. Group related metrics with tight `sm` (8px) spacing and use `2xl` (48px) for major section breaks.

## Elevation & Depth

Depth is conveyed through **Ambient Shadows** and **Tonal Layers**. Instead of harsh black shadows, we use a Deep Navy tint (`#0F172A` at 8-12% opacity) with a high blur radius to create a soft, "lifted" effect.

1.  **Level 0 (Base):** Light gray background (`#F8FAFC`).
2.  **Level 1 (Cards/Surfaces):** Pure white with a 1px subtle border (`#E2E8F0`).
3.  **Level 2 (Interactive/Active):** White surface with a soft ambient shadow (Y: 4, Blur: 12).
4.  **Level 3 (Modals/Overlays):** White surface with a prominent shadow (Y: 12, Blur: 24) and a backdrop blur of 8px on the layers below.

## Shapes

The shape language is consistently **Rounded**, reflecting an approachable and friendly user experience. Standard components (inputs, buttons) use a 0.5rem (8px) radius. Larger containers, such as financial summary cards, use `rounded-xl` (1.5rem/24px) to create a distinct, modern "pocket" look. Selection indicators and small badges should use pill-shaped (fully rounded) geometry to distinguish them from structural containers.

## Components

- **Buttons:** Primary buttons use the Deep Navy background with white text. Success actions (e.g., "Add Income") use Emerald Green. Secondary buttons use a Ghost style (no fill, thin border).
- **Cards:** White backgrounds with `rounded-xl` corners and soft ambient shadows. Internal padding should be `lg` (24px).
- **Input Fields:** Use a subtle light-gray fill with a 1px border. On focus, the border transitions to Deep Navy with a 2px glow. Labels sit above the field in `label-caps`.
- **Chips:** Used for transaction categories. They feature a light-tinted background (5% opacity of the category color) and dark text of the same hue.
- **Lists:** Transaction lists should have no visible borders between items; instead, use whitespace and `body-sm` for dates to separate groups.
- **Progress Bars:** High-contrast Emerald Green against a light gray track. For budget overages, the track transitions to Subtle Coral.