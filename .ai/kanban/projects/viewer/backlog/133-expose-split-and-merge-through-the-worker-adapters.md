---
id: 133
title: Expose split and merge through the worker adapters
type: feature
priority: P1
effort: S
model: sonnet
area: [mesh]
story: US45
milestone: "VSS:M4"
sprint: "VSS:SP19"
depends_on: [130, 131, 48, 49]
created: 2026-10-25
---

Adds `splitComponents` and `mergeMeshes` to the worker_threads and Web Worker adapters with transferable buffers.

**Code:** `vsslicer/modules/mesh/src/adapters/workers/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Results through the worker equal direct calls on the fixtures
- [ ] Cancel terminates a split of a large fixture
- [ ] No SharedArrayBuffer is required

## Tasks

- [ ] Worker messages
- [ ] Both adapters
- [ ] Tests

## Progress

Not started.
