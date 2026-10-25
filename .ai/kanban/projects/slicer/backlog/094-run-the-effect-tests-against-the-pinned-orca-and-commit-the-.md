---
id: 94
title: Run the effect tests against the pinned Orca and commit the report
type: chore
priority: P0
effort: M
model: sonnet
area: [orca, engine]
story: US28
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [93, 92, 26]
created: 2026-10-25
---

Wires the testkit to `OrcaEngine` (callback applies unified patches through emission) and commits the generated capability report for the pinned version.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Every row's effect test passes for Orca where the entry is supported
- [ ] The committed report equals the regenerated one; bumping the pinned version without regenerating fails CI
- [ ] Adaptive layer height and any unsupported row assert their entries

## Tasks

- [ ] Adapter callback
- [ ] Run all effect tests
- [ ] Commit the report

## Progress

Not started.
