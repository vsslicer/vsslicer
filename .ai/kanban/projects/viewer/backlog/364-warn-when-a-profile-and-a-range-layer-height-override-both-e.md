---
id: 364
title: Warn when a profile and a range layer-height override both exist
type: feature
priority: P2
effort: S
model: sonnet
area: [editor]
story: US94
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [347, 356, 150]
created: 2026-10-25
---

Applies the spike's finding on what the engine does when an object has both a variable profile and a range with its own `layer_height`: the editor warns and says which one wins.

**Code:** `vsslicer/modules/project-extension/src/application/layerheight/conflict.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] The rule from the spike note is implemented and named in the warning text
- [ ] Removing one of the two clears the warning

## Tasks

- [ ] Rule
- [ ] Warning
- [ ] Tests

## Progress

Not started.
