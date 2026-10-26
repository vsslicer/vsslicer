---
id: 85
title: Guard the Klipper planner against zero accel or velocity
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-85-worker
docs: [.ai/audits/SP3-audit.md]
created: 2026-10-25
---

Module: gcode-planner (domain). Finding 1 of the SP3 audit, `.ai/audits/SP3-audit.md` (details, file:line and how it was verified are there).

## Acceptance criteria

- [x] A zero or negative accel or velocity (override, SET_VELOCITY_LIMIT VELOCITY=0, M204 S0) never makes Klipper's total time NaN: overrides use the config reader's positivity rule and the file value is ignored (tests)

## Tasks

- [x] Write the failing test
- [x] Fix
- [ ] Release a patch version of each changed module

## Progress

Done. `resolveLimits` now throws RangeError for an override of 0 on `accel` / `maxVelocity` (Marlin per-axis maxima keep 0 = no limit, a Marlin test relies on it). Klipper ignores a non-positive file `VELOCITY` (SET_VELOCITY_LIMIT); M204 S0 was already ignored. Tests in test/limits.test.ts and test/klipper.test.ts; `pnpm lint && pnpm test && pnpm build` pass. Not done: patch release (coordinator releases; CHANGELOG under Unreleased). Files: vsslicer/modules/gcode-planner/src/domain/{klipper,limits}.ts, test/{klipper,limits}.test.ts, CHANGELOG.md.
