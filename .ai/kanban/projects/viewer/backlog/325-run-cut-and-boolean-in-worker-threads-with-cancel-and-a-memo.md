---
id: 325
title: Run cut and boolean in worker_threads with cancel and a memory cap
type: feature
priority: P2
effort: M
model: sonnet
area: [mesh]
story: US90
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [323, 324]
created: 2026-10-25
---

The kernel runs in a worker so the extension host stays responsive; the WASM is loaded in the worker and only on first use.

**Code:** `vsslicer/modules/core/mesh-boolean/src/adapters/worker-node/` (module: `mesh-boolean`, layer: `adapters`)

## Acceptance criteria

- [ ] A cut of the largest fixture does not block the host event loop for more than 50 ms
- [ ] Cancel returns the cancelled error and frees the worker; a memory cap error is typed
- [ ] The WASM is not loaded until the first call (asserted)

## Tasks

- [ ] Worker entry
- [ ] Cancel and cap
- [ ] Tests

## Progress

Not started.
