
**Visual Style**

Clean, minimal, and friendly. White card-based layout with soft shadows, generous white space, and a warm coral/salmon as the primary accent. The overall feel is calm and approachable — finances without the anxiety.

**Color Palette**

| Role | Hex |
|---|---|
| Background | `#F5F6FA` |
| Card / Surface | `#FFFFFF` |
| Primary Accent (CTA, active icons) | `#F07B6B` (coral) |
| Chart — Category 1 | `#7DD5D8` (teal/sky) |
| Chart — Category 2 | `#F07B6B` (coral) |
| Chart — Category 3 | `#F5C242` (amber) |
| Chart — Category 4 | `#2E7D5E` (dark green) |
| Heading text | `#1C3557` (deep navy) |
| Body / label text | `#8A95A5` (muted grey) |

**Typography**

- Headings: Bold, `#1C3557`, ~20–22sp
- Section labels (CATEGORIES, INCOMING EXPENSES): Uppercase, tracked, 11sp, muted grey
- Expense item titles: Semi-bold, 16sp, navy
- Supporting text: Regular, 13sp, muted grey

**Layout — List View (Screen 1)**

- Back arrow + 3-dot menu in top bar
- Page title "My Expenses" + subtitle "Summary (private)" below
- Date row with calendar icon + comparison text ("18% more than last month")
- Section: **CATEGORIES** — 2×2 grid of pill/card buttons with emoji icon + label
- "MORE ▼" expandable row
- Section: **INCOMING EXPENSES** — vertical card list; each card has category label (colored, uppercase), expense name (bold), description text, location row, and a full-width CTA button at the bottom

**Layout — Chart View (Screen 2)**

- Same header and date row
- Toggle between list view and chart view (icon buttons, top-right of section)
- Large donut/doughnut chart centered — center label shows total count + "Expenses"
- Percentage labels on each slice
- Below chart: legend rows — colored square + category name + amount + percentage, with the active/selected row highlighted in amber

**Signature Element**

The coral full-width **CONFIRM** button at the bottom of each expense card — pill-shaped, strong contrast, feels decisive without being alarming.

**Component Notes**

- Category chips: white card, subtle shadow, icon on the left (colored), label text beside it, ~48dp height
- Chart slices: no stroke/gap between them, smooth and solid
- Legend rows: left-aligned color swatch (square, rounded corners), name + amount right-aligned, selected row gets a full amber background highlight with white text