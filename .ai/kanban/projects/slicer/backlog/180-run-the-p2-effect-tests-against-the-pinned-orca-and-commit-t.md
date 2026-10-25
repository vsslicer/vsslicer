---
id: 180
title: Run the P2 effect tests against the pinned Orca and commit the report
type: chore
priority: P2
effort: M
model: sonnet
area: [orca, engine]
story: US59
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [170, 171, 172, 173, 178, 169, 94, 159, 160]
created: 2026-10-25
---

Wires the new `slicer-api@0.3.0` effect tests to `OrcaEngine` and regenerates the capability report for the pinned version.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Every new row's effect test passes for Orca where the entry is supported, and unsupported entries are asserted
- [ ] The committed report equals the regenerated one
- [ ] The colliding sequential fixture yields the typed error of OE1

## Tasks

- [ ] Adapter callback
- [ ] Run all new effect tests
- [ ] Commit the report

## Progress

Not started.
