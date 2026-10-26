---
id: 22
title: Unit-test each Klipper planner rule
type: chore
priority: P0
effort: M
model: sonnet
area: [planner]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP4"
owner: GCP-22-worker
depends_on: [20]
created: 2026-10-25
---

Each rule has a test that names the regression it catches.

## Acceptance criteria

- [x] Junction at 90 and 180 degrees
- [x] Minimum cruise ratio on a zig-zag
- [x] Lookahead flush on a long straight
- [x] Arc segmentation count
- [x] Klipper ignores M201/M203/M205

## Tasks

- [x] Write each test with a comment naming its regression
- [x] Verify each fails when the rule is broken (all but the M201/M203/M205 one, see Progress)

## Progress

Done. Added vsslicer/modules/gcode-planner/test/klipper-rules.test.ts (7 tests, each commented with the regression it catches and a klipper@ee2c6fb file:line for its expected value, derived by hand, no planner output copied). Covers 90/180/0 degree junctions, mcr on a zig-zag (lone-move analytic at scv 0, monotonic otherwise), lazy flush on 1000 x 1 mm straight (and across a corner), arc segment count (floor, helix hypot, even Z/E, via resegmentArc), Marlin limits ignored.
Verified: pnpm lint and pnpm test pass (74 tests). Mutation check on a temp copy of the module (src untouched): wrong jd factor, 180 degree no-stop, mcr cap removed, eager flush, ceil instead of floor, dz dropped from arc length each fail at least one test. Not shown to fail: Marlin-limit leak (my two mutations did not reach the limits, so that test is a plain guard, not proven sensitive). No planner bug found.
Files: vsslicer/modules/gcode-planner/test/klipper-rules.test.ts, vsslicer/modules/gcode-planner/CHANGELOG.md.
