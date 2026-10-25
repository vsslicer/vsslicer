---
id: 37
title: Interpolate the toolhead position inside a move from the trapezoid
type: feature
priority: P0
effort: M
model: opus
area: [simulation]
story: US12
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [23]
created: 2026-10-25
---

Position at time t from E4's `trapezoidsFor` window.

## Acceptance criteria

- [ ] Within 0.01 mm of the planner trapezoid in unit tests for accel, cruise, decel, zero-length moves, moves shorter than the accel distance, arcs (segments from E3), G4 pauses and tool changes

## Tasks

- [ ] Window fetch and cache
- [ ] Interpolation function
- [ ] Edge-case tests

## Progress

Not started.
