---
name: Autonomous Vision Research Console
colors:
  surface: '#051424'
  surface-dim: '#051424'
  surface-bright: '#2c3a4c'
  surface-container-lowest: '#010f1f'
  surface-container-low: '#0d1c2d'
  surface-container: '#122131'
  surface-container-high: '#1c2b3c'
  surface-container-highest: '#273647'
  on-surface: '#d4e4fa'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#d4e4fa'
  inverse-on-surface: '#233143'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#e79400'
  on-tertiary-container: '#563400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#051424'
  on-background: '#d4e4fa'
  surface-variant: '#273647'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  label-xs:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.06em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-desktop: 1rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system targets robotics researchers, computer vision scientists, and autonomous system safety engineers who require split-second situational awareness and telemetry monitoring. The interface evokes mission-critical dependability, rigorous scientific precision, and industrial defense-grade engineering.

The aesthetic fuses **Technical Minimalism** with **HUD Instrumentation**:
- Ultra-dense, information-first layouts engineered to minimize cognitive friction during high-frequency perception anomalies.
- Utilitarian precision over decorative ornamentation: no gratuitous gradients, whimsical illustrations, or squishy consumer-facing radius tokens.
- Restrained, signal-oriented telemetry: luminous accents exist exclusively to communicate system states, latency metrics, neural network confidence scores, and spatial sensor bounds against a deep absorbing substrate.

## Colors

The palette is engineered for prolonged visual endurance in dark laboratory and vehicle cockpit environments, utilizing strict optical hierarchy and semantic contrast.

### Palette Architecture
- **Primary Telemetry (`#06B6D4` / `#3B82F6`):** Precision cyan and radar blue reserved for system telemetry, inference vectors, HUD bounding envelopes, and active sensor traces.
- **System States:**
  - **Healthy / Nominal (`#10B981`, sub: `#059669`):** Perception pipeline locked, neural pathways nominal, Kalman filters converging.
  - **Degraded / Warning (`#F59E0B`, sub: `#D97706`):** Sensor occlusion, frame drop spikes, low-confidence edge heuristics.
  - **Critical / Fallback (`#EF4444`):** Perception pipeline failure, camera feed loss, self-healing failover engagement.
- **Background Tiers:**
  - Base Void: `#0B0F14`
  - Layer 1 Surface (Panels/Viewports): `#121820`
  - Layer 2 Elevation (Cards/Overlays): `#1A222D`
- **Borders & Reticles:** Structural dividers utilize `#222F3E` (ambient borders) and `#334155` (interactive/active borders).
- **Text & Foreground:** Pure high-visibility `#F8FAFC` for real-time reads, muted technical gray `#94A3B8` for secondary labels, and structural dim `#64748B` for inert metadata.

## Typography

The typographic pairing balances human readability under cognitive load with monospaced numerical stability:

- **Primary Interface Font (Inter):** Applied across global structural navigation, analytical summaries, status descriptions, and panel headers. Strict tracking adjustments guarantee dense vertical rhythm and swift vertical scanning.
- **Data & Telemetry Font (JetBrains Mono):** Dedicated to tensor shapes, bounding box coordinates, floating-point confidence values, frame rates (FPS), latency markers (ms), and matrix parameters. Monospace tabular sizing prevents layout jitter when values mutate at 60Hz.
- All technical micro-labels (`label-xs`, `label-sm`) default to uppercase presentation with extended letter spacing for razor-sharp legibility at minimal pixel footprints.

## Layout & Spacing

The layout operates on a compact 4px baseline system within a 12-column or 24-column dynamic grid designed for multi-monitor workstations and field debugging tablets.

### Layout Principles
- **Density:** Compact vertical and horizontal footprints maximize telemetry viewports without visual overlap.
- **Dockable Multi-Viewport Architecture:** Left anchor holds perception stream matrices and HUD viewports; central-right sectors house self-healing state nodes, confidence scatter graphs, and event logs.
- **Responsive Adaptations:**
  - **Desktop (1440px+):** Fixed multi-panel layout with static sidebars and zero-scroll telemetry HUD cards.
  - **Tablet (768px - 1439px):** Collapsible lateral inspectors; viewports resize dynamically while holding aspect ratios.
  - **Mobile (< 768px):** Single-column stacked stream view with priority switching between camera point clouds and system logs.

## Elevation & Depth

This system avoids soft ambient drop-shadows and blur-heavy skeuomorphism, relying instead on **Z-Index Tonal Layering and Border Delineation**:

1. **Substrate (Z: 0):** Canvas base `#0B0F14`, serving as the infinite viewport sink.
2. **Structural Panels (Z: 10):** Surface `#121820` bounded by a 1px solid border of `#222F3E`.
3. **Floating Modules & Active Panels (Z: 20):** Elevated surface `#1A222D` with razor borders `#334155`.
4. **HUD Overlays & Reticles (Z: 30):** High-contrast vector bounds with subtle colored inner glows matching semantic status (e.g., `box-shadow: inset 0 0 8px rgba(6, 182, 212, 0.15)` for cyan tracking envelopes).
5. **Modal Diagnostics (Z: 50):** Semi-opaque backdrop (`rgba(11, 15, 20, 0.85)`) framed by solid `#334155` and a sharp 2px primary accent top border.

## Shapes

The interface embraces a strictly restrained geometric language with minimal corner radii:

- **Radius Scale:** Base radius is fixed at `0.25rem` (4px). Standard elements (data cards, metric blocks, input cells) utilize crisp 4px corners to communicate mechanical precision.
- **Angular Exceptions:** Select visual viewports and HUD elements may feature chamfered 45-degree corner notches (clip-paths) to accentuate defense-grade tactical HUD aesthetics.
- **Pill Shapes:** Strictly prohibited except for binary inline indicator dots (`height: 6px; width: 6px; border-radius: 9999px`).

## Components

### Buttons & Trigger Elements
- **Primary Action (Engage/Trigger):** Surface `#06B6D4` with `#0B0F14` bold text, sharp 4px corners, hover state brightness ramp (`#22D3EE`).
- **Secondary Action (Sub-routine):** Surface `#1A222D`, border 1px solid `#334155`, text `#F8FAFC`. On hover, border transitions to `#06B6D4`.
- **Destructive/Override Action:** Surface transparent, border 1px solid `#EF4444`, text `#EF4444`. On active engagement, background floods to `#EF4444` with `#F8FAFC` text.

### Status Chips & Badges
- **Structure:** Ultra-compact (`padding: 2px 6px`), monospaced typography (`label-xs`), uppercase.
- **State Styling:**
  - *Nominal:* Background `rgba(16, 185, 129, 0.12)`, text `#10B981`, border `1px solid rgba(16, 185, 129, 0.3)`.
  - *Degraded:* Background `rgba(245, 158, 11, 0.12)`, text `#F59E0B`, border `1px solid rgba(245, 158, 11, 0.3)`.
  - *Critical:* Background `rgba(239, 68, 68, 0.15)`, text `#EF4444`, border `1px solid rgba(239, 68, 68, 0.4)`.

### HUD Bounding Box Indicators
- **Perception Vectors:** Crisp 1px cyan (`#06B6D4`) boundaries framing detected spatial hazards.
- **Corner Brackets:** 2px high-visibility accents anchored at the four corners of bounding targets.
- **Telemetry Tag:** Monospace identification label affixed directly to the top-left shoulder of the target showing class name, tracking ID, and inference confidence percentage (e.g., `PED-04 // 98.4%`).

### Data Cards & Metric Cells
- Dark charcoal canvas (`#121820`), continuous hairline perimeter (`#222F3E`).
- Card headers feature small tracking titles (`label-sm`, `#64748B`) followed by prominent tabular telemetry digits (`headline-md` or `label-lg`, `#F8FAFC`).
- Embedded mini sparklines utilize unbroken 1.5px lines with zero area fill to maintain visual austerity.

### Form Inputs & Terminal Controls
- Input background `#0B0F14`, inset hairline border `#222F3E`, text `#F8FAFC`.
- Focus ring: No blurred outline; immediate snap to 1px solid `#06B6D4`.
- Text cursor: Solid cyan block cursor indicating terminal execution readiness.

### Telemetry Lists & Log Streams
- Alternating subtle row separation (`rgba(255, 255, 255, 0.02)`), zero vertical margins.
- Strict column grid: ISO-8601 millisecond timestamp (`#64748B`), subsystem origin (`#94A3B8`), semantic state badge, and monospaced event payload (`#F8FAFC`).