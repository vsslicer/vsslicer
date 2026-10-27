---
id: 20
title: Add the Printers tree view with status and progress
type: feature
priority: P0
effort: M
model: sonnet
area: [api]
story: US4
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [17, 19]
created: 2026-10-25
---

A tree view of printers with state, progress, temperatures and active notifications.

**E70 (D23, 2026-10-27):** the view lives in its own `vsslicer-printers` activity-bar container (title "Printers"), and is checked in the sandbox against the mock printers (PRN-451).

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Printers show state icon, progress and temperatures; active `notifications[]` show with code and severity
- [ ] Updates arrive from status events without polling the tree; a disposed view leaks no listener
- [ ] `contributes.viewsContainers.activitybar` has `vsslicer-printers` holding the view, with welcome content offering Add printer; the extension activates on `onView`, not `*`
- [ ] Integration test (`pnpm test:integration`) with the fake adapter: the tree shows a printer's state and progress and updates on a status event

## Tasks

- [ ] Tree data provider
- [ ] Item rendering
- [ ] Tests with the fake adapter

## Progress

Not started.
