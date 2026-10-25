---
id: 85
title: Guard the Klipper planner against zero accel or velocity
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
docs: [.ai/audits/SP3-audit.md]
created: 2026-10-25
---

Module: gcode-planner (domain). Finding 1 of the SP3 audit, `.ai/audits/SP3-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [ ] A zero or negative accel or velocity (override, SET_VELOCITY_LIMIT VELOCITY=0, M204 S0) never makes Klipper's total time NaN: overrides use the config reader's positivity rule and the file value is ignored (tests)

## Tasks

- [ ] Write the failing test
- [ ] Fix
- [ ] Release a patch version of each changed module

## Progress

Not started.
