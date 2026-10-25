---
id: 6
title: Add the fake engine and the shared engine contract test suite
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [3, 4]
created: 2026-10-25
---

A scriptable fake `SlicerEngine` for consumers' unit tests, and a contract suite every real adapter runs: progress ordering, cancel, staged outputs, error mapping.

**Code:** `vsslicer/modules/slicer-api/` (module: `slicer-api`, layer: n/a (testkit))

## Acceptance criteria

- [ ] The fake emits scripted progress, warnings, outputs and errors and honours cancel
- [ ] The contract suite runs against the fake in this module's tests and is exported for adapters (`@vsslicer/slicer-api/testkit`)
- [ ] A deliberately broken fake (progress after completion, output left after cancel) fails the suite

## Tasks

- [ ] Write the fake
- [ ] Write the contract suite
- [ ] Negative tests with broken fakes

## Progress

Not started.
