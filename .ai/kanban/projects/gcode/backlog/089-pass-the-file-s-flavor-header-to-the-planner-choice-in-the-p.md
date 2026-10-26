---
id: 89
title: "Pass the file's ;FLAVOR: header to the planner choice in the preview"
type: bug
priority: P1
effort: M
model: opus
milestone: "VSS:M1"
sprint: "VSS:SP5"
docs: [.ai/audits/SP4-audit.md]
created: 2026-10-26
---

Module: gcode-preview (application); may need gcode-api/gcode-parser. Finding 2 of the SP4 audit, `.ai/audits/SP4-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] A ;FLAVOR:Klipper file without a config block is timed by the Klipper planner, and Cura files stop showing 'marlin assumed' when the header names the flavour (test)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] CHANGELOG entry (the coordinator releases, rule 21)

## Progress

Not started.
