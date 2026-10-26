---
id: 99
title: "Map flavour names once, in gcode-api, for the parser, planner and language features"
type: bug
priority: P1
effort: M
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP6"
docs: [.ai/audits/SP5-audit.md]
created: 2026-10-26
---

Module: gcode-api (domain), gcode-parser, gcode-planner, gcode-language. Finding 2 of the SP5 audit, `.ai/audits/SP5-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] One Flavour type and flavourFromName in gcode-api used by all three; a Cura ;FLAVOR:RepRap file is parsed and timed with the same flavour
- [ ] A test that fails before the fix

## Tasks

- [ ] Fix as the audit describes

## Progress

Not started.
