---
id: 24
title: Port the Marlin 2 and Prusa Buddy planner
type: feature
priority: P0
effort: L
model: opus
area: [planner]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [19]
created: 2026-10-25
---

Ported from PrusaSlicer@30ef591 libpgcode `TimeMachine.cpp` and `TimeBlock.cpp` (AGPL-3.0), checked against Marlin@2ef3ee6 `src/module/planner.cpp` (GPL-3.0).

## Acceptance criteria

- [x] 16-block reverse and forward pass, junction deviation or classic jerk, M201/M203/M204/M205, firmware arc segmentation with duration hints and the linear-advance accel cap are implemented
- [x] Unit tests per rule: junction angles, lookahead, linear-advance cap, arc segmentation count

## Tasks

- [x] Port time machine and blocks
- [x] Arc segmentation
- [x] Linear advance cap
- [x] Unit tests

## Progress

w-marlin (SP3): `src/domain/marlin.ts` exports `marlinPlanner` (`marlin`), `buddyPlanner` (`prusa-buddy`),
`marlinFamilyPlanner(variant)`, `marlinArcSegments`, `buddyArcSegments`, `BLOCK_BUFFER_SIZE`; tests in
`test/marlin.test.ts` (17). Per-block build, kernels and trapezoid ported from PrusaSlicer@30ef591 libpgcode;
Marlin@2ef3ee6 previous_nominal_speed in the junction cap, LA cap, G2/G3 segment counts and planner hints.
The parser's arc chords are refitted to the circle and re-segmented as the firmware does. Notes:
`.reference/notes/GCP-24-marlin-planner.md`. Open: oracle comparison against PrusaSlicer M73 times on
the golden corpus (GCP-23); M204 S vs P/T order (shortcut, needs ordered state).
