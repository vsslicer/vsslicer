---
id: 80
title: Make the 100 MB summary test and the worker corpus test robust under load
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP3"
docs: [.ai/audits/SP2-audit.md]
created: 2026-10-25
---

Module: gcode-parser. Finding 2 of the SP2 audit, `.ai/audits/SP2-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] Neither test asserts wall-clock time tighter than it can hold on a loaded machine (time budgets relative or generous, documented)
- [ ] Three parallel full-suite runs under CPU load pass

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Not started.
