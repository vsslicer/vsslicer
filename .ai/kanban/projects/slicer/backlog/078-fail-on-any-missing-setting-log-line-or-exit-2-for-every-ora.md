---
id: 78
title: Fail on any missing-setting log line or exit 2 for every oracle tuple
type: chore
priority: P1
effort: M
model: sonnet
area: [cura]
story: US17
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [76, 77, 62]
created: 2026-10-25
---

Proves the resolved input is complete: run the pinned CuraEngine on each fixture tuple.

**Code:** `vsslicer/modules/slicer/cura/` (module: `slicer-cura`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] No tuple logs a 'missing setting' line or exits 2
- [ ] The test prints the missing key if one appears
- [ ] Removing a key from the resolver output makes the test fail (negative test)

## Tasks

- [ ] Run over tuples
- [ ] Log scan
- [ ] Negative test

## Progress

Not started.
