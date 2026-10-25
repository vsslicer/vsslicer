---
id: 12
title: "Benchmark replay of 100,000 events"
type: chore
priority: P1
effort: S
model: sonnet
area: [model]
story: US3
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [7]
created: 2026-10-25
---

Prove the log replay stays fast enough to load on activation.

**Code:** `vsslicer/modules/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] Replay of 100,000 events stays under 200 ms in a benchmark test that fails above the limit (the limit may be scaled by a documented CI factor)

## Tasks

- [ ] Generate the log
- [ ] Write the benchmark test

## Progress

Not started.
