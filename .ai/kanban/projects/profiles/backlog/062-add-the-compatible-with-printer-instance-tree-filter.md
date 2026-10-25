---
id: 62
title: "Add the 'compatible with printer instance' tree filter"
type: feature
priority: P0
effort: S
model: sonnet
area: [store]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [61, 140]
created: 2026-10-25
---

Filters materials and processes by the evaluator for a chosen printer instance.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/tree/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The filter hides incompatible materials in an integration test with a 0.6 mm nozzle instance
- [ ] Clearing the filter restores the full tree

## Tasks

- [ ] Add the filter command and state
- [ ] Integration test

## Progress

Not started.
