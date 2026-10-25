---
id: 276
title: "H2C: print a fixture with timelapse G-code"
type: chore
priority: P2
effort: S
model: opus
area: [postprocess]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [181, 169, 128, PRN-60]
created: 2026-10-25
---

Hardware verification on the owner's H2C: one print with timelapse G-code from a profile (D5).

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (hardware verification))

## Acceptance criteria

- [ ] The G-code shows the timelapse block at each layer change (parser) and the print completes; firmware and Orca versions recorded
- [ ] Whether the printer produced frames is noted (no retrieval is built here)
- [ ] Everything else in E64 stays fixtures only

## Tasks

- [ ] Slice with the timelapse profile
- [ ] Print
- [ ] Record

## Progress

Not started.
