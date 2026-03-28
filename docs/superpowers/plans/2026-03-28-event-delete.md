# Event Delete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two-step whole-event deletion to the sidebar event list and active editor view.

**Architecture:** Add a service/action path for deleting an owned event, thread a `pendingDeleteEventId` state through the existing event routes, and render consistent confirmation UI in both the event rail and current editor header area.

**Tech Stack:** Next.js App Router, React 19, server actions, Drizzle ORM, Vitest, Playwright

---

## Tasks

### Task 1: Service and route plumbing
- Add failing tests for `deleteEvent` service behavior and `deleteEvent` search-param mapping.
- Implement repository/service/action support for deleting an event.
- Pass `pendingDeleteEventId` through `/events` and `/events/[eventId]`.

### Task 2: Sidebar and editor UI
- Add failing component tests for sidebar and current-event delete confirmation UI.
- Implement two-step confirmation in `EventList` and `EventEditorPageContent`.
- Redirect safely after deleting the current event.

### Task 3: Verification
- Run focused tests first, then full verification if needed.
