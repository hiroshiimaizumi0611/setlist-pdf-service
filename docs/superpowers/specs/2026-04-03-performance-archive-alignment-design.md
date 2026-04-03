# Performance Archive Alignment Design

## Summary

The current `/events` screen still behaves like an empty editor shell rather than a dedicated archive workspace. Stitch treats the archive as its own operational surface: a searchable performance database with a technical table, filter band, and action-oriented row controls. This redesign makes `/events` a true archive screen while preserving `/events/[eventId]` as the focused backstage editor.

## Goals

- Turn `/events` into a dedicated archive experience aligned with the Stitch `Performance Archive` screen.
- Keep `/events/[eventId]` as the detailed setlist editor without regressing the recent dark editor work.
- Make the archive easier to scan with a dense technical table instead of rail-style cards.
- Keep `新規公演作成` as the main CTA and send users directly into the editor after creation.
- Reuse existing server actions for create, duplicate, and delete rather than inventing a parallel data flow.

## Non-Goals

- Reworking the detailed editor route `/events/[eventId]` in this pass.
- Adding server-side advanced filtering, pagination, or sorting infrastructure.
- Building new product areas hinted at by Stitch, such as equipment lists or system analytics.
- Replacing the current template or billing flows.

## User Problems

1. `/events` does not feel like the Stitch archive screen; it feels like an editor waiting room.
2. The current archive list is visually mixed into the editor shell and does not read as a searchable database.
3. Users cannot quickly scan metadata such as date, venue, title, theme, and last update in one technical table.
4. Stitch’s archive-specific header, filter band, and list density are not yet represented in the product.

## Proposed UX

### 1. `/events` Becomes The Archive Landing Screen

`/events` should become the default archive workspace, not a placeholder editor.

- Top area follows the Stitch archive rhythm: title, subtitle, and compact system metadata.
- The left rail remains in the dark backstage style, but its primary purpose is navigation and primary actions.
- The main content area is dedicated to archive browsing rather than “create an event to begin editing”.
- Creating a new event still starts from this screen and redirects into `/events/[eventId]`.

### 2. Archive-Specific Search And Filter Band

The screen should include the Stitch archive control area.

- A top search field for archive lookup.
- A filter strip with date range, venue, and theme controls.
- A reset action for returning to the unfiltered list.
- First pass behavior can stay intentionally modest:
  - search filters client-side by title and venue
  - filter controls may be partially functional if their UI is present and clearly scoped

The visual goal is more important than full analytical power in this pass, but the controls should not feel fake.

### 3. Dense Technical Archive Table

The archive body should switch from card-style entries to a proper table.

- Columns:
  - `Date`
  - `Venue`
  - `Show Title`
  - `Theme`
  - `Last Update`
  - `Actions`
- Each row should feel like a production database entry rather than a dashboard card.
- `編集` opens `/events/[eventId]`.
- `複製` and `削除` stay in the action column.
- Row density should be high enough to make the page feel materially different from the editor route.

### 4. Empty State Uses Archive Language

When there are no events, the screen should still feel like the archive page.

- Keep the archive header and filter band visible.
- Replace the current “start editing” waiting-room messaging with archive-oriented copy.
- The main empty state should explain that saved performances will appear here and that users can create the first show immediately.

## Technical Design

### Route Responsibility Split

- `/events`
  - becomes archive-first
  - uses archive-specific page composition
- `/events/[eventId]`
  - remains editor-first
  - keeps the existing `EventEditorPageContent` structure

This separation avoids overloading a single component with two very different jobs.

### New Composition Surface

Introduce a dedicated archive page composition component instead of continuing to branch heavily inside `EventEditorPageContent`.

Likely structure:

- `PerformanceArchivePageContent`
  - header
  - filter/search band
  - archive table
  - empty state handling
- `PerformanceArchiveTable`
  - dense tabular row rendering
- optional small helpers for filter controls or archive stats

`EventList` should not be stretched into a table. It is currently optimized for rail navigation and should either remain editor-specific or be reduced to a smaller navigation responsibility.

### Data And Actions

Reuse existing actions:

- create draft event
- duplicate event
- delete event

No new persistence model is required. The archive screen can derive all of its data from `listEventSummaries`.

If client-side search/filtering is introduced, keep it local to the archive page. Server data remains the source of truth.

### Theming

Dark mode remains the default and primary target.

- Archive screen should match the Stitch `Performance Archive` dark composition.
- Light mode should continue to function, but this pass is judged primarily against the dark Stitch reference.

## Error Handling

- If create fails, the user remains on the archive page with the existing pending affordance.
- Duplicate and delete should preserve current confirmation and pending patterns.
- If filters produce zero matches, render a filtered empty state rather than falling back to a blank table.

## Testing

Add or update tests for:

- `/events` rendering archive-specific heading and metadata
- archive table row content and actions
- create CTA remaining wired from the archive route
- empty state behavior on the archive page
- client-side search and any first-pass filter behavior that becomes functional

Manual verification:

- `/events` feels clearly different from `/events/[eventId]`
- archive table is visually closer to Stitch than the current card list
- create, edit, duplicate, and delete flows still work end to end

## Success Criteria

- `/events` no longer reads as an editor placeholder screen.
- The page visually matches the Stitch archive direction much more closely.
- Users can scan core event metadata in a dense archive table.
- `新規公演作成` still works and continues to enter the editor route.
- The editor route remains intact and focused on setlist editing rather than archive browsing.
