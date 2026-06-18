# Numra — Neubrutalism Design System

This document outlines the **Neubrutalism Pop** design system used across the Numra application. The system represents a bold, confident, and playful aesthetic inspired by modern web design trends and Gen Z styling.

## 1. Core Principles

1. **High Contrast:** Strong delineation between elements. Elements stand out through bold borders rather than subtle shadows.
2. **Sharp Geometry:** Minimal border radius. Elements are mostly rectangular with sharp or very slightly rounded edges.
3. **Hard Shadows:** No blur. Shadows are created using offset solid shapes, creating a "stacked paper" effect.
4. **Vivid Color Blocking:** Saturated, flat colors used in large blocks without gradients.
5. **Mechanical Interactions:** Rigid, pure-translation animations on press (no spring physics).
6. **Bold Typography:** High-impact, geometric sans-serif fonts used at heavy weights, often in ALL-CAPS for structural elements.

## 2. Color Palette

The application uses a dual-theme system, both anchored by high-contrast black and cream.

### Light Theme (Cream Base)
*   **Background:** `#FFFDF5` (Warm Cream)
*   **Surface/Card:** `#FFFFFF`
*   **Elevated/Input:** `#FFF8E7`
*   **Border:** `#000000` (Solid Black)
*   **Text Primary:** `#000000`
*   **Text Secondary:** `#333333`
*   **Text Muted:** `#666666`

### Dark Theme (Deep Purple Base)
*   **Background:** `#1A1A2E` (Deep Purple-Black)
*   **Surface/Card:** `#2D2B55`
*   **Elevated/Input:** `#3D3A6E`
*   **Border:** `#FFFDF5` (Cream)
*   **Text Primary:** `#FFFDF5`
*   **Text Secondary:** `#D4D2E8`
*   **Text Muted:** `#9B98C4`

### Semantic & Accent Colors (Shared)
Vivid, high-saturation colors used to block out key areas.
*   **Accent:** `#FF6B6B` (Hot Red)
*   **Income/Success:** `#2ECC71` (Vivid Green)
*   **Expense/Danger:** `#FF6B6B` (Hot Red)
*   **Loan/Warning:** `#FFD93D` (Vivid Yellow)
*   **Bill:** `#C4B5FD` (Soft Violet)
*   **Bank:** `#45B7D1` (Bright Cyan)
*   **Wallet:** `#FF8C42` (Bright Orange)

## 3. Typography

*   **Primary Font:** `Space Grotesk` (Geometric, slightly quirky)
    *   **Bold (700):** Used for headlines, large balances, and ALL-CAPS structural labels (tabs, section titles).
    *   **Medium (500):** Used for body text, button labels, and standard UI text.
    *   **Regular (400):** Used sparingly for muted descriptions.
*   **Monospace Font:** `JetBrains Mono`
    *   **Medium/Bold:** Exclusively used for financial amounts and dates to ensure tabular alignment and a technical feel.

## 4. Key Visual Components

### Borders
*   **Width:** `4px` in Light Mode, `3px` in Dark Mode.
*   **Application:** Applied to almost every structural element: cards, buttons, inputs, tab bars, headers, and bottom nav.

### Shadows
*   **Style:** Hard offset. No blur radius.
*   **Offset:** `X: 4, Y: 4` (Down and right).
*   **Color:** Solid `#000000` (Light Mode) or `#FFFDF5` (Dark Mode).
*   **Implementation:** Achieved via an absolutely positioned `View` sitting behind the main element, slightly offset.

### Corners (Border Radius)
*   **Cards/Buttons/Inputs:** `4px` (very slight rounding to prevent harsh pixelation) or `0px` (completely sharp).
*   **Icons/Badges:** `4px` or `0px`.
*   *Note: Traditional pill shapes or full circles are avoided entirely.*

## 5. Interaction Design

### The "Mechanical Press"
Instead of scaling down or using spring physics, interactive elements use a rigid translation effect.
*   **Action:** On press, the element translates `+4px` on both X and Y axes.
*   **Result:** The element perfectly covers its own hard shadow, giving the physical sensation of a button being pushed into a panel.
*   **Timing:** Linear/cubic, fast duration (`80ms`).

## 6. Layout Rules

*   **Headers:** Thick bottom border, ALL-CAPS bold titles.
*   **Tab Bar:** Thick top border, no rounded corners, square active states.
*   **Cards:** Thick borders all around, hard shadow underneath.
*   **Spacing:** Follows a strict `4px` baseline grid (`Spacings: 4, 8, 12, 16, 20, 24, 32, 40`).