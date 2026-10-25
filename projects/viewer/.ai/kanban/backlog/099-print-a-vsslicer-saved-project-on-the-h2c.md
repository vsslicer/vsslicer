---
id: 99
title: Print a VSSlicer-saved project on the H2C
type: chore
priority: P1
effort: M
model: opus
area: [3mf]
story: US30
milestone: "VSS:M4"
depends_on: [91, SLC-42, PRN-48]
created: 2026-10-25
---

Hardware check of the whole write path: save an edited fixture, slice it with the Orca CLI, send it through the Bambu adapter and print the plate.

**Code:** `vsslicer/modules/3mf/docs/h2c-verification.md` (module: `3mf`, layer: n/a (hardware verification))

## Acceptance criteria

- [ ] The printed plate has the expected objects at the expected positions; firmware version and Orca version recorded
- [ ] Photos or a note of the result are in the card
- [ ] Everything else stays fixtures (D5)

## Tasks

- [ ] Save and slice
- [ ] Send with AMS mapping
- [ ] Print and record

## Progress

Not started.
