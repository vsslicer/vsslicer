---
id: 45
title: Produce reference thumbnails from Orca for ColPic and BTT TFT
type: chore
priority: P1
effort: S
model: sonnet
area: [engine]
story: US11
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [43]
created: 2026-10-25
---

Reference G-code files with ColPic and BTT TFT thumbnails produced by the installed Orca on the owner's machine (the engine needs GL for them), with the source image.

**Code:** `vsslicer/modules/slicer-output/` (module: `slicer-output`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Fixtures with `PROVENANCE.md` (Orca version, settings, image) for each format
- [ ] Each file's thumbnail block is extractable by `@vsslicer/gcode` or carries its documented marker

## Tasks

- [ ] Generate with Orca
- [ ] Add provenance
- [ ] Check extraction

## Progress

Not started.
