---
id: 308
title: Add the bucket fill and smart fill tools
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, painting]
story: US82
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [307, 291]
created: 2026-10-25
---

One click fills the region under the cursor with the bucket tool or the smart fill tool and its angle limit; the fill runs in the worker with a progress hint and is one undo step.

**Code:** `vsslicer/modules/project-extension/src/presentation/webview/paint/fill.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Clicking a fixture face fills its region; smart fill stops at the angle set
- [ ] The fill runs in the worker and a click during it is ignored or queued, never lost
- [ ] Undo removes the fill

## Tasks

- [ ] Tools
- [ ] Angle control
- [ ] Worker call
- [ ] Harness test

## Progress

Not started.
