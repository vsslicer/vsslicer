---
id: 161
title: Measure gizmo drag on the 5 M triangle fixture
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US42
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [153, 36, 76]
created: 2026-10-25
---

Measures frame time while dragging on the 5 million triangle fixture and records the result.

**Code:** `vsslicer/modules/project-extension/test/perf/` (module: `project-extension`, layer: n/a (benchmark))

## Acceptance criteria

- [ ] Frame time during a drag is recorded and no mesh upload happens during the drag
- [ ] The number is printed in the CI log

## Tasks

- [ ] Scenario
- [ ] Record

## Progress

Not started.
