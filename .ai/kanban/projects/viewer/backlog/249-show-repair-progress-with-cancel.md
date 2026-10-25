---
id: 249
title: Show repair progress with cancel
type: feature
priority: P1
effort: S
model: sonnet
area: [repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [246, 247]
created: 2026-10-25
---

A progress notification with cancel for repair on request.

**Code:** `vsslicer/modules/project-extension/src/presentation/repair/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Progress follows the worker; cancel leaves the object unchanged
- [ ] No dialog blocks the editor

## Tasks

- [ ] Notification
- [ ] Test

## Progress

Not started.
