---
id: 95
title: "Use gcode-parser's bgcodeSource in loadPreview and drop the gcode-bgcode dependency"
type: bug
priority: P2
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-preview (application). Finding 11 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] loadPreview opens .bgcode through bgcodeSource; gcode-preview no longer depends on gcode-bgcode; tests pass

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Not started.
