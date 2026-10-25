---
id: 19
title: "Define planner interface, MachineLimits, Timing output and checkpoints"
type: feature
priority: P0
effort: L
model: opus
area: [planner]
story: US7
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [1, 4]
created: 2026-10-25
---

One planner interface, one implementation per firmware, per D-eng review: `plan(parsed, limits) -> Timing`, start times (f32 in the buffer, f64 sums), layer and role time tables, `estimate` and limit-source flags.

## Acceptance criteria

- [ ] `MachineLimits` resolves in order: explicit override, the file's config block, flavour defaults, with the source recorded (test per source)
- [ ] Missing limits set an `assumed limits` flag; unknown flavour uses Marlin and says so (tests)
- [ ] Timing carries start times into the move buffer, per-layer and per-role tables and checkpoints; a trivial constant-speed planner passes the harness
- [ ] Planner runs in the parser worker, is cancellable and reports progress

## Tasks

- [ ] Types and resolver
- [ ] Timing tables
- [ ] Checkpoint structure
- [ ] Test harness with a trivial planner

## Progress

Not started.
