---
id: 8
title: "Compute per-job filament, weight, cost and the slicer estimate; add readSummary"
type: feature
priority: P0
effort: M
model: sonnet
area: [parser]
story: US2
milestone: "VSS:M1"
depends_on: [7]
created: 2026-10-25
---

Gives FIL consumption booking, SLC output checks and the viewer the statistics without moves.

## Acceptance criteria

- [ ] Summary matches the slicer's own summary comments (or `slice_info.config`) per extruder on every fixture
- [ ] `readSummary(uri)` returns the statistics without allocating move buffers (test)
- [ ] Missing statistics yield absent fields, not zeros (test)

## Tasks

- [ ] Read per-slicer summary comments
- [ ] Implement `readSummary`
- [ ] Per-extruder tests against goldens

## Progress

Not started.
