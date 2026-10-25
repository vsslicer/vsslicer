---
id: US67
title: "Get binary G-code from PrusaSlicer and preview it"
status: reviewed
epic: VSS:E65
---

As a Prusa printer owner, I want `.bgcode` output with thumbnails that previews like text G-code, so that I can send it to my printer.

## Acceptance criteria

- [ ] `.bgcode` produced through the adapter is parsed by `@vsslicer/gcode` with the same moves as the text output of the same slice, and thumbnails are present
- [ ] The pipeline names any text post-processing step it cannot run on `.bgcode` and slices text G-code instead with a warning
- [ ] Slice and preview with Prusa opens the `.bgcode` in the preview

## Out of scope

- Writing `.bgcode` ourselves
