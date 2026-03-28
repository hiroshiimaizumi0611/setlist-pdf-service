# Event Delete Design

## Summary

The app currently supports deleting setlist items, but not deleting an entire event/setlist. We will add a consistent two-step event deletion flow in both the sidebar event list and the current event editor so users can safely remove a whole setlist.

## Goals

- Allow deleting an entire event/setlist.
- Expose the same confirmation pattern in both the sidebar list and the current event editor.
- Keep the interaction consistent with existing item deletion.
- Redirect safely after deleting the currently open event.

## UX

- In the sidebar event list, each event gets a `削除` affordance.
- In the active editor view, the current event gets a `このセットリストを削除` affordance.
- First interaction shows `削除を確定` and `キャンセル`.
- After deleting the current event, redirect to `/events?theme=<currentTheme>`.
- After deleting from the archive/sidebar context, revalidate and remain on `/events` unless the current event was deleted.

## Technical Design

- Add `deleteEvent` to the events service layer.
- Add repository support for deleting the parent event record. Child setlist items should disappear through existing database cascade behavior or transaction-safe deletion.
- Add `deleteEventAction` and `deleteEventFormAction` in app actions.
- Extend event routes/pages to accept a `deleteEvent` search param and pass `pendingDeleteEventId`.
- Extend `EventEditorPageContent` and `EventList` to render the confirmation UI.

## Safety

- Ownership checks must match the existing event/item mutation rules.
- A pending delete state must only confirm the targeted event.
- Redirect after deleting the current event must not land on a deleted page.

## Testing

- Service test for deleting an owned event.
- Route test for `deleteEvent` search param mapping.
- Component tests for sidebar and current-event confirmation states.
- End-to-end flow should continue passing.
