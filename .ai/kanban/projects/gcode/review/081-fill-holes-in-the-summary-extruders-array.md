---
id: 81
title: Fill holes in the summary extruders array
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP3"
docs: [.ai/audits/SP2-audit.md]
created: 2026-10-25
---

Module: gcode-parser. Finding 5 of the SP2 audit, `.ai/audits/SP2-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] `filament used [mm] = nan, 120.5` and `= 1,,3` yield a dense `extruders` array with `{}` for unknown slots (test first)
- [x] `for...of` over every corpus summary works

## Tasks

- [x] Write the failing test
- [x] Fix
- [x] Release a patch version of each changed module

## Progress

Done in gcode-parser 0.8.4 (published).
