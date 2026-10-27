---
id: 257
title: Map progress callbacks and cancel the embedded engine within 2 seconds
type: feature
priority: P2
effort: M
model: sonnet
area: [embedded]
story: US73
milestone: "VSS:M5"
sprint: "VSS:SP50"
depends_on: [256]
created: 2026-10-25
---

Turns `--progress_cb` and `--slice_info_cb` into progress events and cancels by killing the child.

**Code:** `vsslicer/modules/slicer/embedded/src/adapters/...` (module: `slicer-embedded`, layer: `adapters`)

## Acceptance criteria

- [ ] Progress events rise from 0 to 100 on a fixture slice
- [ ] Cancel returns within 2 s and leaves nothing in staging (stub that sleeps and a real run)
- [ ] A progress callback with an unknown stage is ignored, not fatal

## Tasks

- [ ] Callback parsing
- [ ] Cancel
- [ ] Tests

## Progress

Not started.
