---
id: 53
title: "Compare the assembled archive with Orca's own `--export-3mf` and the G-code reader"
type: chore
priority: P1
effort: M
model: sonnet
area: [engine]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [52, 27, GCP-16]
created: 2026-10-25
---

Oracle tests for the archive: Orca's own export is the structural reference and `@vsslicer/gcode` opens the result.

**Code:** `vsslicer/modules/slicer/output/` (module: `slicer-output`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] For each fixture plate, the part list and `slice_info` key set equal Orca's `--export-3mf` output (pinned Orca, CI)
- [ ] `@vsslicer/gcode` opens the archive by plate with statistics and thumbnails, and the MD5 check is green; a doctored G-code makes it fail
- [ ] `3mf` validation passes

## Tasks

- [ ] Export with Orca
- [ ] Structural diff
- [ ] Open with the parser

## Progress

Not started.
