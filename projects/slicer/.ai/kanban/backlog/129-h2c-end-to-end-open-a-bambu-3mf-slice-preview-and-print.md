---
id: 129
title: "H2C end to end: open a Bambu 3MF, slice, preview and print"
type: chore
priority: P0
effort: S
model: opus
area: [tasks, engine]
story: US25
milestone: "VSS:M3"
depends_on: [127, 128, PRN-60]
created: 2026-10-25
---

The first complete loop on the owner's machine (D5): Bambu 3MF with an imported profile, slice, preview in `vsslicer.gcode`, print on the H2C via `vsslicer.bambu`.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (hardware verification))

## Acceptance criteria

- [ ] The print completes (or reaches the first layers and is stopped by the owner); firmware, Orca and VSSlicer versions recorded
- [ ] The preview shows the toolhead path of the same file that printed
- [ ] The run is described step by step in `docs/` for contributors

## Tasks

- [ ] Run the loop
- [ ] Record
- [ ] Write the checklist

## Progress

Not started.
