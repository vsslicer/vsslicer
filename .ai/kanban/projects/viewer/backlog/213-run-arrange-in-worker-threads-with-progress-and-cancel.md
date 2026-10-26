---
id: 213
title: Run arrange in worker_threads with progress and cancel
type: feature
priority: P1
effort: M
model: sonnet
area: [arrange]
story: US61
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [212]
created: 2026-10-25
---

Runs `arrange`, and later `fillBed` and `multiply`, in a worker with progress events and cancel; no result is returned after cancel.

**Code:** `vsslicer/modules/arrange/src/adapters/worker/` (module: `arrange`, layer: `adapters`)

## Acceptance criteria

- [ ] Results through the worker equal direct calls on the fixtures
- [ ] Cancel stops the run and returns a cancelled outcome with no poses
- [ ] The calling thread is not blocked (event loop delay test)

## Tasks

- [ ] Worker entry
- [ ] Progress and cancel
- [ ] Tests

## Progress

Not started.
