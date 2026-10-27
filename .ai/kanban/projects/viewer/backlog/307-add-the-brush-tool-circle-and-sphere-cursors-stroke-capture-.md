---
id: 307
title: "Add the brush tool: circle and sphere cursors, stroke capture and one undo step per stroke"
type: feature
priority: P2
effort: M
model: sonnet
area: [viewer, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [305, 306, 301, 291]
created: 2026-10-25
---

Paints supports, seams and colours while the pointer drags: candidates from the BVH, selection on the main thread, live overlay, and one stroke command on pointer up.

**Code:** `vsslicer/modules/apps/project/src/presentation/webview/paint/brush.ts` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A drag on the fixture paints enforcers, blockers, seam marks and a colour; undo removes the whole stroke and redo restores it
- [ ] Circle and sphere cursors both work; the sphere reaches hidden faces the circle does not
- [ ] The stroke command carries only the changed subtrees

## Tasks

- [ ] Pointer handling
- [ ] Live preview
- [ ] Command on pointer up
- [ ] Harness test

## Progress

Not started.
