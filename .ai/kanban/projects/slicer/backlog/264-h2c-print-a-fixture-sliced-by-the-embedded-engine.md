---
id: 264
title: "H2C: print a fixture sliced by the embedded engine"
type: chore
priority: P3
effort: S
model: opus
area: [embedded]
story: US76
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [262, 128, 261]
created: 2026-10-25
---

Sanity print on the H2C of one fixture sliced by the embedded engine, if the engine has an H2C profile (D5).

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (hardware verification))

## Acceptance criteria

- [ ] The fixture prints, or the note says the engine has no H2C profile and the check is skipped
- [ ] Firmware and engine revision are recorded
- [ ] No quality claim is made beyond "prints"

## Tasks

- [ ] Check the profile exists
- [ ] Slice and print
- [ ] Record

## Progress

Not started.
