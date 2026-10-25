---
id: 226
title: Slice an arranged fixture with the Orca CLI and check for out-of-bed warnings
type: feature
priority: P1
effort: S
model: sonnet
area: [arrange]
story: US62
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [221, 203, SLC-30]
created: 2026-10-25
---

Arranges a fixture (rectangular and excluded-area bed), saves it and slices it through `slicer-orca`.

**Code:** `vsslicer/modules/project-extension/test/integration/arrange/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The slice completes with no object-outside-bed warning in the output
- [ ] Runs in CI on Linux

## Tasks

- [ ] Harness
- [ ] Check

## Progress

Not started.
