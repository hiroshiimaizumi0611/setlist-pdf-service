# Stitch Editor Redesign Design

## Summary

This spec defines a focused redesign of the event editor UI so that `/events` and `/events/[eventId]` visually match the Stitch `Setlist Editor` screens much more closely.

The goal is not to "freshen up" the existing dashboard. The goal is to replace the current card-based editor shell with a dense backstage-style layout that follows the Stitch structure, spacing, hierarchy, and interaction model.

This spec covers only the editor UI redesign. PDF redesign, archive/templates alignment, and other screen restyling will be handled separately.

## Why This Change

The current implementation is functionally complete, but it does not feel like the Stitch design source:

- The current editor uses large hero headers and stacked cards.
- Stitch uses a fixed production-style top bar, a dense left rail, and flatter content regions.
- The current setlist area is a traditional table.
- Stitch uses row-based production strips with hover-revealed controls.
- The current page feels like a generic admin dashboard.
- Stitch feels like a backstage operations tool.

For this project, the Stitch screen is the design source of truth.

## Scope

### In scope

- `/events`
- `/events/[eventId]`
- dark theme first, then light theme using the same structural layout
- top header, left rail, metadata strip, add-item strip, setlist row list, empty area
- existing actions wired into the new layout

### Out of scope

- PDF visual redesign
- billing page redesign
- templates/archive redesign beyond editor shell dependencies
- auth screen redesign
- schema or service-layer changes unless needed to support editor layout behavior

## Design Source of Truth

The redesign should follow these Stitch screens:

- `design/stitch/project-16774743705046066908/screens/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.html`
- `design/stitch/project-16774743705046066908/screens/8d426adf04034b19bceac56faa05e789-setlist-editor-light.html`

The dark version is the primary reference.

## UX Goals

- The editor should feel like a live production tool, not a generic SaaS dashboard.
- Primary actions should stay visually obvious without adding noise.
- Dense information should remain immediately scannable.
- The user should be able to open a show, add or reorder items, and export PDF without hunting through the page.
- The dark theme should carry the strongest identity and set the structural baseline.

## Non-Goals

- Do not preserve the current layout just because it already exists.
- Do not invent new visual patterns that are absent from the Stitch editor.
- Do not broaden scope into a complete design-system rewrite.
- Do not redesign workflows or business rules unless current UI structure blocks Stitch alignment.

## Target Layout

### 1. Fixed top bar

Replace the current page header area with a fixed production toolbar modeled on Stitch:

- left cluster:
  - product wordmark / title
  - small nav tabs or labels matching the backstage-tool feeling
- center/right cluster:
  - current show indicator
  - theme toggle
  - settings/help style affordances where appropriate
  - save action
  - prominent PDF export button

This top bar should define the page identity. The current oversized page heading should be removed from the primary visual hierarchy.

### 2. Fixed left rail

The event list should become a true production rail:

- fixed width
- high-density list
- strong selected state
- clear new event action
- recent/upcoming grouping language
- bottom utility/user area if still useful

The left rail should feel closer to the Stitch backstage navigation than to a standard card list.

### 3. Main editor body

The editor body should be a flat sequence of horizontal bands:

- metadata strip
- add-item strip
- setlist rows
- empty drop/add area

The current "hero header + stacked cards" composition should be removed.

## Information Architecture

### Metadata strip

The metadata form should become a single aligned strip with four visible fields:

- date
- venue
- show title
- theme select

Design requirements:

- flat, band-like container
- compact labels
- bold values
- Stitch-like spacing and borders

Additional notes or lower-priority metadata can remain available, but must not dominate the first screenful.

### Add-item strip

The item creation area should match Stitch's one-line production input model:

- type selection presented as compact segmented controls or tight tabs
- single primary title input
- strong add button at the row end

Optional fields like artist, duration, and notes should not force the initial input row to become tall. They can move into secondary editing UI if needed.

### Setlist rows

The setlist should no longer present as a regular admin table.

Each item becomes a production row with:

- cue number area
- subtle type label
- dominant title text
- optional supporting detail
- hover/focus controls on the right

Row styles should differ by item type in a Stitch-like manner:

- songs are the default production rows
- MC and transition rows have lighter or flatter treatment
- headings feel like structural separators rather than normal rows

### Empty lower area

Keep a visible lower add area or empty zone if it helps mimic the Stitch composition, but it should feel intentional and operational rather than decorative.

## Visual Direction

### Typography

Follow the Stitch editor hierarchy:

- strong geometric display type for major labels and controls
- clean body text for operational details
- mono text only where it improves cue readability

Avoid the current oversized hero feel and avoid generic dashboard typography rhythm.

### Density

Use tighter spacing than the current implementation.

- less vertical padding in list rows
- more information above the fold
- flatter panels
- fewer isolated card blocks

### Borders and surfaces

Follow Stitch's flatter, sharper style:

- strong linear boundaries
- thin sectioning and strip-based grouping
- minimal rounded-card language
- dark theme built from blacks, charcoal, muted grays, and yellow accents

### Theme model

The dark theme is the primary reference and should be tuned first.

The light theme should reuse the same structure and switch to the Stitch light palette:

- white and off-white surfaces
- black structural borders
- yellow highlight accents
- paper-manuscript feeling instead of generic admin light mode

## Component Strategy

The current editor composition is too card-oriented, so the redesign may replace or heavily rewrite:

- `components/dashboard-shell.tsx`
- `components/event-list.tsx`
- `components/event-metadata-form.tsx`
- `components/setlist-item-form.tsx`
- `components/setlist-table.tsx`
- `components/theme-toggle.tsx`
- `components/export-pdf-button.tsx`
- `components/event-editor-page-content.tsx`

### Expected component shape after redesign

- a shell focused on fixed top bar + fixed left rail
- an editor header strip for current show and actions
- a compact metadata strip component
- a compact add-item strip component
- a row-based setlist list component
- row actions that preserve current server-action behavior

The data model and service layer should stay intact unless the new UI reveals a real functional gap.

## Interaction Rules

### Keep existing behaviors

The redesign must preserve:

- create event
- duplicate event
- update metadata
- add item
- reorder items
- delete item
- template save access
- theme toggle
- PDF export

### Reorder controls

Stitch shows compact operations on hover. We should keep the current up/down reorder behavior, but present it in the Stitch control cluster.

### Row editing

The current inline edit details can remain, but should be visually secondary. The first screenful should match Stitch's flatter operational list.

### Empty states

The no-event and low-content states should inherit the Stitch editor language rather than revert to generic dashboard cards.

## Technical Constraints

- Do not break existing server actions.
- Keep the editor routes and route-level responsibilities unchanged.
- Avoid unnecessary service or schema changes.
- Preserve testability for event creation, duplication, and template flows.
- Minimize visual drift between `/events` and `/events/[eventId]`.

## Testing and Validation

### Required validation

- existing event editor unit tests updated or expanded as needed
- existing E2E setlist flow remains green
- visual spot checks against Stitch screenshots for dark and light editor views
- manual validation that top bar, left rail, metadata strip, add-item strip, and setlist rows all align with Stitch intent

### Visual acceptance criteria

The redesign is acceptable when:

- the page no longer reads as a stacked-card dashboard
- the dark editor resembles the Stitch editor at first glance
- the main actions occupy the same visual roles as Stitch
- the setlist rows feel operational and dense
- the light editor reads like the Stitch light manuscript variant rather than a recolored dashboard

## Recommended Implementation Order

1. Replace the shell with Stitch-like fixed top bar + left rail
2. Redesign metadata strip
3. Redesign add-item strip
4. Replace table with row-based setlist list
5. Tune dark theme against Stitch
6. Port the same structure to light theme
7. Update tests and manual screenshots

## Risks

- Trying to preserve too much of the current component styling will keep the page in a halfway state.
- If optional item fields remain too prominent, the add-item strip will drift away from Stitch.
- If the row list remains too table-like, the editor will still feel wrong even if colors improve.

## Recommendation

Treat this as a real UI reconstruction, not a polish pass.

The fastest route to matching the Stitch editor is to keep the current data/actions but rebuild the editor presentation around Stitch's shell, strip-based sections, and row-based list patterns.
