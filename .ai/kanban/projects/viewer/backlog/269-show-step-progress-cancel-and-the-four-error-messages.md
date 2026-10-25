---
id: 269
title: "Show STEP progress, cancel and the four error messages"
type: feature
priority: P1
effort: S
model: sonnet
area: [step]
story: US69
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [268, 259]
created: 2026-10-25
---

A progress notification with cancel, and a message for each error class that says what to do.

**Code:** `vsslicer/modules/project-extension/src/presentation/step/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each error class shows its own message
- [ ] Cancel returns to the previous state with the project unchanged

## Tasks

- [ ] Notification
- [ ] Messages
- [ ] Test

## Progress

Not started.
