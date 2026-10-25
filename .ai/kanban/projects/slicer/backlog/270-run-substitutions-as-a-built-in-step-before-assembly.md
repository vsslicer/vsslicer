---
id: 270
title: Run substitutions as a built-in step before assembly
type: feature
priority: P2
effort: M
model: sonnet
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [184, 268, 269, 110]
created: 2026-10-25
---

Registers the step in the pipeline before thumbnails and `.gcode.3mf` assembly, reading rules from the job's profile (Prusa key and Cura entries), so MD5 and metadata are computed afterwards.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] Recorded Orca and CuraEngine outputs with Prusa rules from imported profiles produce the expected substituted text (fixture pairs)
- [ ] The assembled archive's MD5 matches the substituted G-code
- [ ] A failing rule fails the slice naming the rule and leaves `.vsslicer/sliced/` untouched
- [ ] The step is skipped with a reason when the job has no rules

## Tasks

- [ ] Rule source
- [ ] Step registration
- [ ] Order test with assembly
- [ ] Failure test

## Progress

Not started.
