---
id: 226
title: Record stderr and outputs of failing slices
type: chore
priority: P2
effort: S
model: sonnet
area: [prusa]
story: US66
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [217, 218]
created: 2026-10-25
---

Checks in recorded stderr and output states for each failure path of 2.9.x and 3.0: missing output, empty output, error line with output, error line without.

**Code:** `vsslicer/modules/slicer/prusa/test/fixtures/` (module: `slicer-prusa`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] One fixture per case per version with `PROVENANCE.md` (version, argv, date)
- [ ] A script regenerates them from a local install
- [ ] The 3.0 exit-0 case is included

## Tasks

- [ ] Provoke failures
- [ ] Save stderr and output state
- [ ] Provenance

## Progress

Not started.
