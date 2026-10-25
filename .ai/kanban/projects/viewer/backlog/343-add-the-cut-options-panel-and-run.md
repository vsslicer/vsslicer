---
id: 343
title: Add the cut options panel and run
type: feature
priority: P2
effort: S
model: sonnet
area: [viewer, editor]
story: US87
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [342]
created: 2026-10-25
---

Keep upper, lower or both, cut to parts or to objects, and the Cut button with progress, cancel and the refusal message.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/cut/panel.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Each option reaches the command payload (asserted in the harness)
- [ ] Cut runs the command as one undo step; a refusal leaves the model unchanged

## Tasks

- [ ] Panel
- [ ] Run
- [ ] Harness test

## Progress

Not started.
