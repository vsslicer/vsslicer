---
id: 72
title: Capture and check an H2C-sliced project
type: chore
priority: P0
effort: S
model: sonnet
area: [plates]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [61, 74]
created: 2026-10-25
---

A `.gcode.3mf` sliced by Bambu Studio for the H2C, committed under the size cap, and the viewer test that opens it. No firmware is involved (D5).

**Code:** `vsslicer/fixtures/3mf/h2c/` (module: `project-extension`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] The fixture opens with the correct plates and thumbnails in the viewer test
- [ ] `PROVENANCE.md` records Bambu Studio version and the printer profile (H2C)
- [ ] The owner supplies the slicing if the CLI cannot (OWNER default noted)

## Tasks

- [ ] Capture
- [ ] Viewer test
- [ ] PROVENANCE.md

## Progress

Not started.
