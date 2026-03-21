# Design System Strategy: Live Production and Backstage

## 1. Overview and Creative North Star
Creative North Star: "The Technical Manuscript"

This design system rejects the softness of modern SaaS in favor of a rigid, high-utility aesthetic that bridges the gap between a printed technical rider and the high-contrast environment of a dark stage. It is built for speed, precision, and absolute legibility under pressure.

The layout is driven by a "Sheet Logic", where information is categorized into dense, functional blocks that evoke the feeling of a master production schedule. By eliminating rounded corners and relying on tonal layering rather than lines, the UI feels carved out of the screen.

## 2. Colors and Surface Logic

The palette is split for two environments:

- bright "Production Office" light mode
- high-intensity "Backstage Pit" dark mode

Surface hierarchy:

- Base layer: `surface` `#131313`
- Section containers: `surface_container_low` `#1C1B1B`
- Actionable cards: `surface_container_high` `#2A2A2A`
- Active states: `surface_bright` `#393939`

Rules of engagement:

- Avoid explicit 1px section borders. Prefer surface shifts.
- Use a translucent surface with blur for floating headers.
- Use a subtle gradient from `primary` `#FFF6DF` to `primary_container` `#FFD700` for the primary CTA.
- Reserve `primary_fixed_dim` `#E9C400` for high-priority tape-marker accents.

## 3. Typography

Typography should look like a technical sheet:

- `Space Grotesk` for set titles, venue names, and technical data
- `Inter` for administrative content
- Monospace styling for track numbers such as `M01`
- Japanese body copy should stay at weight `500` or above
- Small uppercase labels for metadata such as BPM and timecode

## 4. Elevation and Depth

- Prefer nested surface tiers over card shadows
- Use pure black ambient shadows only for floating overlays
- If a divider is necessary, use `outline_variant` at very low opacity

## 5. Component Direction

Buttons:

- Primary CTA should be a square yellow "Generate PDF" button
- Secondary actions should use text-led, low-chrome treatments

Track rows:

- No dividers
- Monospace index on the left
- Title centered in the content column
- Optional right-aligned metadata
- Cyan tape strip for tracks with backing-track or click cues

Inputs:

- Flat-bottom style
- 2px bottom border
- Active state uses the primary color with a subtle glow

Action chips:

- Rectangular, no rounding
- Use the secondary container palette

## 6. Do and Don't

Do:

- keep the UI dense and scannable
- use monospaced data for indices and timing
- keep corners square

Don't:

- use soft mid-tone grays
- use decorative card shadows
- rely on standard table dividers
