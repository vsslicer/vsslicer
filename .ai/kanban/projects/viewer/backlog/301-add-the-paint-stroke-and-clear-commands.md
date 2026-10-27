---
id: 301
title: Add the paint stroke and clear commands
type: feature
priority: P2
effort: M
model: sonnet
area: [editor, painting]
story: US81
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [300, 100, 103, 291]
created: 2026-10-25
---

A stroke command stores only the `PaintDelta` of changed subtrees and inverts it; clear removes one kind on one volume or object. Each stroke is one undo step.

**Code:** `vsslicer/modules/apps/project/src/application/commands/paint/` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Execute then undo restores the layer exactly; redo returns to the end
- [ ] The serialised payload size is proportional to the changed triangles (asserted on the 100 k fixture)
- [ ] Registered with the command generator of the undo property test with a random-stroke payload generator
- [ ] A stroke on a locked plate's object is refused with the reason

## Tasks

- [ ] Stroke command
- [ ] Clear command
- [ ] Generator registration
- [ ] Tests

## Progress

Not started.
