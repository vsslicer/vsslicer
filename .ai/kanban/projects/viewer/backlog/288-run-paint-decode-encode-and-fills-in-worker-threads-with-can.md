---
id: 288
title: "Run paint decode, encode and fills in worker_threads with cancel"
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [277, 284, 286]
created: 2026-10-25
---

Decoding the strings of a 1 M triangle mesh on load and encoding them on save run off the extension host thread, with progress and cancel.

**Code:** `vsslicer/modules/core/mesh/src/adapters/worker-node/paint.ts` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Decode and encode of the 1 M fixture run in a worker; the host event loop is not blocked more than 50 ms
- [ ] Cancel returns without a partial result
- [ ] Results are transferred, not copied

## Tasks

- [ ] Worker entry
- [ ] Progress and cancel
- [ ] Test

## Progress

Not started.
