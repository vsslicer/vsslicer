---
id: 23
title: Spike and build planner checkpoints and trapezoidsFor with a property test
type: feature
priority: P0
effort: M
model: opus
area: [planner]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [20]
created: 2026-10-25
---

Checkpoints replace storing entry, cruise and exit speeds per move (about 12 bytes per move) so E5 can recompute any window.

## Acceptance criteria

- [ ] Spike measures checkpoint spacing against recompute cost for a 1-second scrub window; the chosen spacing is recorded in a note in `.reference/notes/`
- [ ] `trapezoidsFor(range)` returns entry, cruise, exit and accel for any window
- [ ] Property test over random windows: recompute equals the full pass

## Tasks

- [ ] Measure spacing options
- [ ] Implement checkpoints and `trapezoidsFor`
- [ ] Property test
- [ ] Record the spacing

## Progress

Not started.
