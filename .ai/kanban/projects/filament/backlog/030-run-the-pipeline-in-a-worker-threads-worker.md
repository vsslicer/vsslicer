---
id: 30
title: Run the pipeline in a worker_threads worker
type: feature
priority: P1
effort: M
model: opus
area: [import]
story: US10
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [29]
created: 2026-10-25
---

Parse 15,070 variants off the extension host, in chunks, with the `all.ndjson` stream as the documented fallback if the memory spike demands it.

**Code:** `vsslicer/modules/filament-ofd/src/adapters/...` (module: `filament-ofd`, layer: `adapters`)

## Acceptance criteria

- [ ] The full current OFD bulk file imports in the worker and the host event loop is blocked no more than 50 ms at a time (measured)
- [ ] The worker's memory peak is recorded in the test log; a worker crash returns a typed error and leaves the previous catalogue

## Tasks

- [ ] Write the worker
- [ ] Measure blocking and memory
- [ ] Crash test

## Progress

Not started.
