---
id: 29
title: Slice a Bambu 3MF plate for the H2C with the installed Orca and record versions
type: chore
priority: P0
effort: S
model: opus
area: [orca, engine]
story: US7
milestone: "VSS:M3"
depends_on: [24, 1]
created: 2026-10-25
---

Owner-machine check (D5): the adapter slices the H2C fixture plate with the installed Orca and the H2C machine profile. No printing here.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (hardware verification))

## Acceptance criteria

- [ ] The G-code is produced and parsed by `@vsslicer/gcode`; layer count matches `expected.json`
- [ ] Orca version, date and OS recorded in the card Progress and `docs/`
- [ ] Anything beyond this check (printing) is verified in the E27 and E29 cards

## Tasks

- [ ] Run on the owner's machine
- [ ] Parse
- [ ] Record versions

## Progress

Not started.
