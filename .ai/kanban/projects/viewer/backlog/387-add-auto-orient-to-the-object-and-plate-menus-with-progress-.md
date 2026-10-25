---
id: 387
title: "Add Auto-orient to the object and plate menus with progress, cancel and the arrange offer"
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, arrange]
story: US98
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [385, 157, 224, 223]
created: 2026-10-25
---

The menu entries, a progress notification with cancel, a summary (oriented, skipped on locked plates, already best) and an offer to run arrange afterwards.

**Code:** `vsslicer/modules/project-extension/src/presentation/menus/orient.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Auto-orient on an object and on a plate runs from the menu; cancel stops and keeps finished objects as one undo step or none
- [ ] The summary lists skipped objects on locked plates
- [ ] Accepting the arrange offer runs the existing arrange command; declining does nothing

## Tasks

- [ ] Menu entries
- [ ] Progress
- [ ] Summary and offer
- [ ] Harness test

## Progress

Not started.
