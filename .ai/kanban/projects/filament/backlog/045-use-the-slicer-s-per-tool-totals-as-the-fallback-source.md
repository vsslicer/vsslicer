---
id: 45
title: "Use the slicer's per-tool totals as the fallback source"
type: feature
priority: P1
effort: M
model: sonnet
area: [consumption]
story: US16
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [39, GCP-8, PRN-14]
created: 2026-10-25
---

For adapters that report nothing, fetch the sliced file through the session's file operations and read `; filament used [g]` per tool with `@vsslicer/gcode-parser` `readSummary` (GCP-8).

UNRESOLVED: needs gcode-parser: a release card for `readSummary`; GCP-8 is depended on directly.

**Code:** `vsslicer/modules/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] Orca, PrusaSlicer, Bambu Studio and Cura outputs give the expected per-tool grams; a multi-tool job books per tool
- [ ] No footer or an unparseable file returns a `NoUsageData` result (nothing booked)

## Tasks

- [ ] Write the source
- [ ] Fixture tests per slicer

## Progress

Not started.
