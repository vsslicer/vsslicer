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
depends_on: [19]
created: 2026-10-25
---

Ported from PrusaSlicer@30ef591 libpgcode `TimeMachine.cpp` and `TimeBlock.cpp` (AGPL-3.0), checked against Marlin@2ef3ee6 `src/module/planner.cpp` (GPL-3.0).

## Acceptance criteria

- [ ] 16-block reverse and forward pass, junction deviation or classic jerk, M201/M203/M204/M205, firmware arc segmentation with duration hints and the linear-advance accel cap are implemented
- [ ] Unit tests per rule: junction angles, lookahead, linear-advance cap, arc segmentation count

## Tasks

- [ ] Port time machine and blocks
- [ ] Arc segmentation
- [ ] Linear advance cap
- [ ] Unit tests

## Progress

Not started.
