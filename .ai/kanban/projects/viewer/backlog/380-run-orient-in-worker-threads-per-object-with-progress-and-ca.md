---
id: 380
title: Run orient in worker_threads per object with progress and cancel
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US97
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [379]
created: 2026-10-25
---

Orients many objects in parallel workers, reporting progress per object; cancel stops the remainder and returns what was finished.

**Code:** `vsslicer/modules/core/mesh/src/adapters/worker-node/orient.ts` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] 20 fixture objects orient with progress events; cancel returns the finished ones and none half-done
- [ ] The host event loop is not blocked more than 50 ms

## Tasks

- [ ] Worker entry
- [ ] Progress and cancel
- [ ] Tests

## Progress

Not started.
