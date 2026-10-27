---
id: 260
title: Run the effect tests and the I5 checks against the embedded engine
type: chore
priority: P2
effort: M
model: sonnet
area: [embedded]
story: US75
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [259, 169, 1, GCP-8, 254]
created: 2026-10-25
---

Runs the shared effect tests, the layer-count check and the estimate comparison on the embedded engine's fixtures and commits the report.

**Code:** `vsslicer/modules/slicer/embedded/` (module: `slicer-embedded`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The effect tests of every supported row pass and the unsupported rows are asserted
- [ ] Layer count equals `expected.json`; the time estimate is within the tolerance used for CuraEngine in I5
- [ ] The committed report equals the regenerated one

## Tasks

- [ ] Adapter callback
- [ ] Run checks
- [ ] Commit the report

## Progress

Not started.
