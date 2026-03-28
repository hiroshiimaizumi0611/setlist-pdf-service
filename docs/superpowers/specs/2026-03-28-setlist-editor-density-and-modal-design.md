# Setlist Editor Density And Modal Design

## Summary

The current setlist editor is visually close to the Stitch direction, but the item list is still too tall and too unstable during editing. Each row expands inline when the user opens `details`, which makes the list hard to scan, pushes items below the fold, and can leave the layout feeling broken after interaction. This redesign makes the setlist area behave like a dense backstage production list: compact rows for scanning, drag-and-drop ordering on desktop, and a centered modal for editing.

## Goals

- Make the setlist list meaningfully denser so more items fit on screen at once.
- Keep action buttons visually aligned in a clean horizontal action cluster.
- Remove the inline edit expansion behavior that causes row height instability.
- Move editing into a centered modal that feels deliberate and easier to use.
- Replace the current up/down ordering buttons with drag-and-drop on desktop.
- Keep mobile usable by prioritizing quick review plus edit/delete actions.

## Non-Goals

- Reworking the event metadata strip or add-item strip beyond minor spacing adjustments.
- Replacing the overall editor shell again.
- Building advanced multi-select or bulk editing.
- Adding third-party drag-and-drop dependencies unless native drag proves inadequate.

## User Problems

1. Rows are too tall, so users must scroll too much even for modest setlists.
2. Action buttons do not stay in a clean horizontal line.
3. Opening inline edit controls makes rows expand and destabilizes the list.
4. The current interaction feels closer to an expanding form than a production sheet.

## Proposed UX

### 1. Compact Production Rows

Each setlist item becomes a single compact row with a fixed rhythm.

- Desktop structure: `drag handle / cue / main content / duration / action cluster`
- Mobile structure: `cue + main content` on the first line, `duration + actions` on the second line
- Title remains the visual priority.
- Artist and notes collapse into a short muted support line, truncated when necessary.
- MC, transition, and heading rows keep their distinct tone, but use the same vertical rhythm as songs wherever possible.

Target outcome: users can see substantially more rows without the page feeling cramped or chaotic.

### 2. Horizontal Action Cluster

The right side of each row becomes a stable action area.

- `編集` and `削除` always appear horizontally aligned.
- Desktop drag handle sits on the far left, so action width is reserved for edit/delete only.
- Delete confirm stays inline in the action area, but must not push the row taller.
- No wrapping to a second line on desktop widths targeted by the Stitch editor layout.

### 3. Modal Editing

Editing moves out of the row and into a centered modal.

- Clicking `編集` opens a modal overlay above the editor.
- Modal contains item type, title, artist, duration, and notes.
- Save and cancel live in a fixed footer area inside the modal.
- Closing the modal returns the list to the same compact state as before.
- Only one item can be in edit mode at a time.

This removes the current source of layout breakage and matches the “operator console” feel better than inline expansion.

### 4. Drag-And-Drop Reordering

Desktop ordering changes from `上へ / 下へ` buttons to direct manipulation.

- Each row gets a visible drag handle.
- Users drag rows to reorder them.
- Reorder feedback should be clear enough to understand where the row will land.
- Mobile does not need drag-and-drop in this pass.
- On mobile, edit/delete remain available and the list stays dense.

## Technical Design

### Component Changes

`SetlistTable` will be reorganized into two responsibilities:

- A compact row renderer for the list itself
- A modal editing surface that receives the selected item

Likely supporting pieces:

- `SetlistRow` for dense row rendering and drag affordance
- `SetlistItemEditModal` for centered editing flow

`EventEditorPageContent` remains the composition point, but should not own modal state unless it is needed for server action integration. Prefer keeping row/modal interaction localized around the setlist list.

### State Model

Client state is needed for:

- the currently editing item id
- drag source / target interaction state

Server actions remain the source of truth for:

- saving edited items
- deleting items
- persisting reordered item ids

The modal should prefill from the current item snapshot and submit through existing update actions.

### Drag Approach

Start with native HTML drag-and-drop to avoid adding a new dependency during this cleanup. If that proves too brittle, a follow-up can swap in a dedicated sortable solution, but the first pass should stay lightweight.

Desktop only:

- rows become draggable
- the handle communicates affordance
- drop recalculates ordered ids and reuses the existing reorder action

Mobile:

- no drag affordance
- no up/down fallback in this pass

## Error Handling

- If edit save fails, the modal stays open and preserves the user’s input if possible.
- If reorder fails, the list should fall back to server truth on refresh/navigation rather than leaving a half-local fake order.
- Delete confirmation must remain explicit, but compact.

## Testing

Add or update tests for:

- dense row rendering without inline `details`
- modal open/close behavior
- action buttons staying available in the compact row view
- reorder submission path for drag-and-drop ordering
- route/component tests updated for new editing affordances

Manual verification:

- desktop list density feels clearly improved
- edit modal does not change underlying row height
- rows remain visually aligned across song / MC / transition / heading types

## Success Criteria

- Users can see more setlist items at once than before.
- Opening edit no longer changes list row height.
- `編集` and `削除` appear as a clean horizontal action group.
- Desktop ordering works through drag-and-drop instead of up/down buttons.
- The editor feels closer to the Stitch production-sheet mood while remaining faster to operate.
