# PDF Polish And Dark Editor Alignment Design

## Summary

This spec defines a focused visual polish pass for two connected surfaces:

- the printable setlist PDF
- the setlist editor UI

The goal is to make both surfaces feel much closer to the Stitch dark-direction source of truth, with the PDF treated as the highest-priority artifact and the editor updated afterward to share the same atmosphere, typography, spacing, and production-tool tone.

This is not a workflow rewrite. It is a visual and layout refinement pass that keeps the current feature set while correcting the remaining design drift.

## Why This Change

The current implementation is functionally strong, but two issues remain:

- the PDF does not yet feel fully aligned with the Stitch dark preview direction
- the setlist editor still feels adjacent to Stitch rather than truly matching its tone

The user also called out two concrete PDF issues in the current dark rendering:

- the first song row feels visually different from the rest of the song rows
- the transition row is not optically centered in the same way as the MC row

Those are not isolated bugs. They indicate that the typographic system and alignment logic still need a final polish pass.

## Scope

### In scope

- dark-theme PDF visual refinement
- song, MC, transition, and heading row alignment polish in the PDF
- overall PDF spacing, borders, hierarchy, and typography tuning toward Stitch dark
- setlist editor visual refinement toward the Stitch dark source
- editor shell, metadata strip, add-item strip, row list, and action styling polish
- keeping preview and downloaded PDF visually identical in structure

### Out of scope

- new product features
- schema changes
- billing logic changes
- archive/templates redesign outside of editor-shell dependencies
- auth page redesign
- light-theme-first rethinking

### Light theme handling

The dark theme is the design target for this pass.

The light theme may inherit shared spacing or typography fixes where those fixes come from shared layout code, but this task does not require a separate light-theme visual redesign.

However:

- light theme must remain functional
- light theme must not regress structurally
- preview and download parity must continue to hold in both themes if the same shared document logic is used

## Design Source Of Truth

Primary reference:

- `design/stitch/project-16774743705046066908/screens/6421425f53c24fa2bdfb2c429cbb2aa0-pdf-preview-dark.html`
- `design/stitch/project-16774743705046066908/screens/37b9f1721b8c43a09f38b1d7915f0243-setlist-editor-dark.html`

Secondary references:

- `design/stitch/project-16774743705046066908/screens/1a5dd724f19843948b2f6459eb6f2d34-pdf-preview-light.html`
- `design/stitch/project-16774743705046066908/screens/8d426adf04034b19bceac56faa05e789-setlist-editor-light.html`

The dark PDF preview and dark setlist editor are the primary visual references.

## UX Goals

- The PDF should feel like a finished backstage production sheet, not an approximate rendering.
- The editor should feel like the same product family as the PDF.
- Typography should feel deliberate and consistent between screen and paper.
- The dark theme should carry the strongest identity.
- Dense information should stay easy to scan in both screen and paper form.

## Non-Goals

- Do not change the product’s information architecture unless current layout prevents Stitch alignment.
- Do not add decorative elements that are absent from the Stitch direction.
- Do not preserve existing spacing or row treatments if they visibly fight the Stitch dark style.

## PDF Redesign

### 1. Typographic normalization for song rows

Song rows should read as a consistent series of production cues.

Required outcomes:

- the first song row must no longer look heavier, larger, or differently positioned than later rows
- all song title baselines should align consistently
- left cue labels such as `M01`, `M02`, `M03` should sit in a stable optical relationship with their song titles

This likely requires tuning:

- title font-size
- title font-weight
- line-height
- row padding
- vertical alignment between cue box and title column

The visual target is a stable repeated rhythm, where `M01` through later songs feel like one system.

### 2. MC and transition centering logic

MC rows currently feel better centered than transition rows. Transition rows should be rebuilt so their visual center matches the same optical logic used by MC.

Required outcomes:

- the transition label should read as intentionally centered, not slightly offset
- surrounding divider lines should balance the title block on both sides
- the left-side cue cell for transition rows must not distort the centered appearance of the main title

The user’s complaint is about optical centering, not merely mathematical centering. The implementation should be tuned by what looks centered on the page.

### 3. Dark PDF visual direction

The PDF should be pushed closer to the Stitch dark preview in the following ways:

- stronger title block hierarchy at the top
- cleaner yellow accent usage
- sharper row rhythm
- more intentional border contrast
- tighter spacing where Stitch feels denser
- less “generic rendered page” feeling

Specific direction:

- header yellow rule should feel clean and deliberate
- document title and event title should have stronger hierarchy
- event meta line should feel more refined and less incidental
- row separators should be quiet but clearly intentional
- left cue cells should feel like stitched-in production labels, not generic table cells

### 4. Shared paper system

The PDF preview route and downloaded PDF must continue to come from the same document source.

This polish pass may change presentation, but it must not reintroduce separate render logic or parallel layout sources.

### 5. Density-aware page fitting

The PDF should no longer assume one fixed typography scale regardless of item count.

Instead, the dark PDF should use a staged layout strategy that reacts to total content density while keeping readability first.

Required behavior:

- when the total number of rows is small, the PDF should use a looser presentation so a single A4 page feels balanced rather than sparse
- when the total number of rows is moderate, the PDF should use the standard layout
- when the total number of rows is high, the PDF may reduce font size, row height, and spacing in a controlled way
- when readability would fall below the acceptable threshold, the document must move to a second page instead of continuing to shrink

The preferred model is a small number of discrete layout presets rather than a fully continuous scaling formula.

The target preset families are:

- `relaxed`
- `standard`
- `compact`
- `multi-page`

The exact thresholds can be tuned during implementation, but the behavior must follow these rules:

- `relaxed` is for low-density setlists and should visibly increase the size and spacing of all row types
- `standard` is the default baseline
- `compact` may reduce the size and spacing of songs, MC, transition, and heading rows together, but only within a readability-safe range
- `multi-page` begins when the content would no longer be comfortably readable in `compact`

This is not a one-page-at-all-costs requirement.

If the document becomes too dense, multiple pages are the correct result.

## Editor Redesign

### 1. Dark-first visual alignment

The editor should be pushed closer to the Stitch dark setlist editor so it feels like the control surface for the same printed sheet.

This means:

- darker, flatter surfaces
- stronger yellow highlight discipline
- denser row rhythm
- more backstage-tool tension and less dashboard softness

### 2. Shell and strip refinement

The following areas should be tuned against the Stitch dark source:

- top bar
- left rail
- metadata strip
- add-item strip
- setlist row list

Desired changes:

- slightly less card-like feeling
- flatter bands and strips
- stronger top-level hierarchy
- reduced softness in spacing and rounding
- more deliberate visual relationship between screen rows and paper rows

### 3. Row presentation

The setlist row list should visually echo the PDF system more strongly:

- cue labels should feel closer to the printed cue blocks
- song title hierarchy should match the dark PDF tone
- MC / transition / heading rows should feel differentiated in the same family as the paper design
- action controls should stay functional but visually secondary

## Acceptance Criteria

### PDF

- the first song row uses the same title sizing, baseline rhythm, and vertical alignment system as later song rows
- song rows read as one repeated rhythm when comparing `M01` through later songs in the dark PDF
- transition rows appear optically centered like MC rows when viewed in the dark PDF preview and in the downloaded dark PDF
- heading rows are intentionally separated from normal song rows and remain visually consistent with the dark production-sheet hierarchy
- the dark PDF header, metadata line, cue cells, dividers, and row spacing are updated toward the Stitch dark reference rather than the older looser rendering
- preview and downloaded PDF continue to be generated from the same source document
- preview and downloaded dark PDF remain visually equivalent in structure, row order, and theme treatment after the polish pass
- low-density setlists use a visibly larger, more spacious presentation on a single A4 page
- high-density setlists attempt a controlled compact layout before adding pages
- if the compact layout would become hard to read, the PDF uses multiple pages instead of shrinking further
- the same density-selection logic applies to songs, MC, transition, and heading rows as one coordinated layout system

### Editor

- the top bar, left rail, metadata strip, add-item strip, and setlist row list are all visually adjusted toward the Stitch dark reference
- the editor uses flatter, denser dark surfaces than the current implementation
- the setlist row list shares a clearer visual relationship with the dark PDF through cue treatment, title hierarchy, and row rhythm
- existing editor behavior remains intact for creating, editing, reordering, deleting, previewing, and exporting items

### Light theme regression boundary

- if shared typography or spacing changes affect light theme, the light theme must still render correctly
- no new light-theme-specific redesign work is required for this task
- no preview/download parity regression is allowed in light theme

## Validation

Validation should rely on:

- direct visual comparison against the Stitch dark references
- screenshot checks of the rendered PDF preview
- downloaded PDF spot checks
- editor screen checks in dark theme
- spot checks that light theme still renders correctly after shared layout updates
- spot checks of at least:
  - a low-density setlist
  - a medium-density setlist
  - a high-density setlist that still fits on one page
  - a very high-density setlist that correctly flows to multiple pages
- existing automated tests staying green, with targeted test updates only where the visual contract or DOM structure changes
