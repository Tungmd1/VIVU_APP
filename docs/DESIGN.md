---
name: Luminous Solar-Cyber HUD
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3b494c'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6b7a7d'
  outline-variant: '#bac9cc'
  surface-tint: '#006875'
  primary: '#006875'
  on-primary: '#ffffff'
  primary-container: '#00e5ff'
  on-primary-container: '#00626e'
  inverse-primary: '#00daf3'
  secondary: '#b60059'
  on-secondary: '#ffffff'
  secondary-container: '#e30071'
  on-secondary-container: '#fffbff'
  tertiary: '#695f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#e6d300'
  on-tertiary-container: '#635a00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9cf0ff'
  primary-fixed-dim: '#00daf3'
  on-primary-fixed: '#001f24'
  on-primary-fixed-variant: '#004f58'
  secondary-fixed: '#ffd9e1'
  secondary-fixed-dim: '#ffb1c5'
  on-secondary-fixed: '#3f001b'
  on-secondary-fixed-variant: '#8f0045'
  tertiary-fixed: '#fae500'
  tertiary-fixed-dim: '#dbc900'
  on-tertiary-fixed: '#1f1c00'
  on-tertiary-fixed-variant: '#4f4800'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Outfit
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 60px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Outfit
    fontSize: 38px
    fontWeight: '800'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Outfit
    fontSize: 17px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Outfit
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Outfit
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  telemetry-header:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.08em
  telemetry-data:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.04em
  telemetry-micro:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.12em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-energy convergence between radiant Solar-punk optimism and precision Cyberpunk HUD telemetry, built strictly on high-luminosity foundations. Dominant dark themes and muddy shadows are prohibited. The emotional tone conveys hyper-advanced clarity, clean-energy infrastructure, scientific optimism, and aerospace instrumentation.

### Visual Dialect
- **Luminous Cyber-Glass**: Crisp translucent panels layered over micro-pattern cyber grids, rendered with optical diffusion and edge refraction rather than dark murkiness.
- **Optic HUD Instrumentation**: Structural framing utilizes dynamic telemetry markers, crosshair ticks, technical corner brackets, dynamic readout indices, and high-frequency metric nodes.
- **Hyper-Chromatic Accents**: Concentrated spectral energy deployed across pristine white and iridescent field layers using laser cyan, neon solar amber, electric magenta, and synthetic lime.
- **Vector Purity**: Strict vector iconography via Bootstrap Icons; emojis and organic illustrative fluff are entirely banned in favor of technical symbols, status glyphs, and mechanical monoline visual identifiers.

## Colors

The palette operates under a high-key daylight paradigm. Contrast is achieved through precise neon-frequency chromatic shifts set against high-albedo surfaces and anchored by structural deep navy glyphs.

### Systematic Roles
- **Base Substrates**: Primary canvas is pure white (`#ffffff`), transitioning into structural containers tinted with iridescent ice cyan (`#e0f7fa`) and ethereal synthetic lavender (`#f3e8ff`).
- **Primary Energy (Laser Ice Cyan - `#00e5ff`)**: Primary telemetry streams, optic focus rings, active HUD borders, and scanning nodes.
- **Secondary Strike (Hyper Electric Magenta - `#ff2a85`)**: Critical over-rides, reactive highlights, vital diagnostics, and high-priority action alerts.
- **Tertiary Resonance (Solar Neon Yellow/Amber - `#ffea00` / `#ffb300`)**: Solar yield metrics, secondary system warnings, active telemetry readouts, and power states.
- **Auxiliary System (Radiant Synth Mint - `#00e676`)**: Nominal status verification, clean-energy cycles, and synchronized data links.
- **Typography & Structural Grid (Deep Slate Navy - `#0f172a`)**: Primary typographic readouts, micro-data values, and technical reticles. Secondary labels utilize tinted slate (`#475569`). Pure black (`#000000`) is never used.

## Typography

The typographic hierarchy implements a high-tech split: **Outfit** governs humanistic, high-legibility display structures and narrative communication, while **JetBrains Mono** controls all machine readouts, metric coordinates, status telemetry, and spatial HUD labels.

### Typographic Execution Rules
- All `telemetry-*` tiers must be displayed in full uppercase with positive tracking to reinforce instrumentation characteristics.
- Numeric metrics must consistently enforce tabular figures (`font-variant-numeric: tabular-nums`) within `JetBrains Mono` to prevent layout shift during real-time data streaming.
- Dynamic data fields must be preceded by coordinate indexes (e.g., `SYS.LOC //`, `VOLT:`, `FREQ::`) styled at the `telemetry-micro` tier.

## Layout & Spacing

The layout is built mobile-first, deploying a 4-column fluid matrix on mobile screens (< 768px), reflowing into an 8-column layout on tablets (768px–1023px), and stabilizing into a 12-column telemetry grid on desktop displays (>= 1024px).

### Grid & Geometric Rhythm
- **Background Cyber Grid**: Canvas surfaces incorporate a crisp, mathematical background micro-grid using `linear-gradient` overlays with 24px step intervals tinted with `rgba(0, 229, 255, 0.08)`.
- **Corner Anchors & Margins**: Mobile layout relies on strict edge-to-edge functional utility with `margin: 1rem` safe areas, expanding to `2.5rem` on wide displays to house outer telemetry rails, vertical status coordinate indicators, and navigational tick marks.
- **HUD Frame Grouping**: Sub-components are bound into self-contained instrument arrays using `space-sm` for intra-data relationships and `space-lg` for decoupled cluster divisions.

## Elevation & Depth

Spatial hierarchy discards traditional drop shadows and dark vignettes in favor of photonic emission, chromatic edge-glows, and light-refracting layered glassmorphism.

### Depth Mechanics
- **Base Plane**: Pure white canvas with subtle geometric laser grids.
- **Tier 1 (Surface Glass)**: Translucent milky white background (`rgba(255, 255, 255, 0.72)`) backed by a high-frequency frosted backdrop filter (`backdrop-filter: blur(16px)`), bordered with ultra-fine optic white lines (`1px solid rgba(255, 255, 255, 0.9)`) and dual inner edge tints.
- **Tier 2 (Active Telemetry Panels)**: Surfaces set to `rgba(224, 247, 250, 0.55)`, framed by laser cyan perimeter tracks (`1px solid rgba(0, 229, 255, 0.6)`), projecting a luminous cyan aura (`box-shadow: 0 0 20px -3px rgba(0, 229, 255, 0.25)`).
- **Tier 3 (Floating Overlays & Controls)**: High-albedo glass (`rgba(255, 255, 255, 0.92)`), framed with hybrid linear-gradient borders (`linear-gradient(135deg, #00e5ff, #ff2a85)`), elevated strictly through chromatic outer glows (`box-shadow: 0 0 24px -2px rgba(255, 42, 133, 0.2), 0 0 12px rgba(0, 229, 255, 0.3)`).
- **HUD Edge Notches**: Structural modules use pseudo-element HUD crosshairs and corner brackets (`+` or `L`-brackets) positioned outside the panel padding to indicate active telemetry zones.

## Shapes

The design system employs a calibrated balance of low-radius geometric precision (`roundedness: 1`, baseline `0.25rem` / 4px) combined with angular HUD cuts and chamfered aesthetics. Organic, bubble-like pill shapes are prohibited.

### Architectural Geometry
- **Primary Modules**: Standard cards, containers, and fieldsets adopt sharp-soft corners (`rounded: 0.25rem` / `4px`) maintaining high structural density.
- **Cyber Chamfers**: Tactical controls, hero telemetry badges, and primary action buttons feature angled corners (via `clip-path: polygon(...)` cutting 6px to 8px diagonally at 45-degree angles on top-right and bottom-left bounds).
- **HUD Frame Brackets**: Visual framing relies on 90-degree corner brackets with 1.5px stroke thickness flanking panel perimeters.

## Components

### Buttons
- **Primary Cyber Action**: Clipped 45-degree chamfered geometry. Background is radiant laser cyan (`#00e5ff`) with deep slate typography (`#0f172a`, `telemetry-header`). Surrounding glow: `0 0 16px rgba(0, 229, 255, 0.5)`. Hover states induce hyper-saturation with electric magenta edge strikes (`#ff2a85`).
- **Secondary HUD Button**: Transparent luminous glass base (`rgba(255, 255, 255, 0.6)`) with a 1px border of `#00e5ff`. Text in `#0f172a`. Corner ticks on top-left and bottom-right.
- **Destructive/Critical Action**: Electric magenta fill (`#ff2a85`), pure white text, framed by an active crimson-magenta photon field (`box-shadow: 0 0 18px rgba(255, 42, 133, 0.45)`).

### Chips & Telemetry Badges
- Compact rectangular profiles with chamfered edges. Typographic styling locked to `telemetry-micro`.
- Must contain an active status indicator (pulsing monochromatic vector dot or directional indicator from Bootstrap Icons).
- Color-coded: Nominal (`#00e676` mint tint), Solar Grid Sync (`#ffea00` amber tint), Alert/Overdrive (`#ff2a85` magenta tint).

### Input Fields
- Luminous glass surface (`rgba(255, 255, 255, 0.85)`) framed by a subtle slate border (`rgba(15, 23, 42, 0.15)`).
- Prefix iconography strictly utilizes technical Bootstrap Icons (e.g., `bi-terminal`, `bi-cpu`, `bi-broadcast`).
- Focus state triggers an immediate shift: border snaps to `1.5px solid #00e5ff`, inner field receives light cyan hue, and active outer HUD brackets illuminate at the corner boundaries.
- Labels are rendered in `telemetry-data` uppercase with deep slate tone.

### Checkboxes & Radio Controls
- **Checkboxes**: Square 16px frame with clipped corners. Checked state fills with `#00e5ff`, displaying a deep slate check mark vector (`bi-check-lg`) with an outward neon glow.
- **Radios**: Diamond or octagonal geometry instead of plain circles. Selected state features a glowing `#ff2a85` center core with an optic perimeter pulse.

### Cards & Telemetry Nodes
- **Structure**: High-luminosity frosted surface (`rgba(255, 255, 255, 0.75)` + `backdrop-filter: blur(12px)`).
- **HUD Telemetry Accents**: Each card includes top-right system coordinates (e.g., `SEC_04 // NODE.A`) rendered via `telemetry-micro`.
- **Divider Lines**: High-precision 1px optic rules composed of cyan gradients tapering into transparent edges (`linear-gradient(90deg, #00e5ff, transparent)`).

### Specialized HUD Components
- **Telemetry Dials & Radial Meters**: SVG vector rings with solar amber (`#ffea00`) and laser cyan (`#00e5ff`) stroke tracks against translucent backgrounds. Metric readouts in `JetBrains Mono` anchored dead-center.
- **Optic Data Lists**: Borderless list items separated by dashed cyan telemetry guides (`1px dashed rgba(0, 229, 255, 0.35)`). Values are right-aligned using tabular figures with status-colored mini-badges.