---
id: 235
title: Run repair in the mesh workers with progress and cancel
type: feature
priority: P1
effort: M
model: sonnet
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [234, 48, 49]
created: 2026-10-25
---

Adds `repairOnLoad` to the worker_threads and Web Worker adapters with progress and cancel.

**Code:** `vsslicer/modules/mesh/src/adapters/workers/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Results through the worker equal direct calls
- [ ] Cancel stops a repair of a 5M triangle mesh within 1 s
- [ ] The host and UI threads are not blocked

## Tasks

- [ ] Worker messages
- [ ] Progress and cancel
- [ ] Tests

## Progress

Not started.
