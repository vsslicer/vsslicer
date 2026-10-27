---
id: 241
title: Handle `.bgcode` outputs in the slice pipeline
type: feature
priority: P2
effort: M
model: sonnet
area: [prusa, postprocess]
story: US67
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [239, 111, GCP-14, 238]
created: 2026-10-25
---

The pipeline treats `.bgcode` as a final artefact: text-only steps (scripts, regex, our thumbnails) cannot run on it. If any is configured the adapter is asked for text G-code and the report says why.

**Code:** `vsslicer/modules/apps/slicer/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] A job with a text step and `binary_gcode` on produces text G-code and a warning naming the step; with no text step it commits the `.bgcode`
- [ ] The committed `.bgcode` has no `.gcode.3mf` assembly and no thumbnail injection (assembler skipped with a reason)
- [ ] A failure at any step leaves `.vsslicer/sliced/` byte-identical

## Tasks

- [ ] Format decision
- [ ] Skip reasons
- [ ] Tests with fake adapter

## Progress

Not started.
