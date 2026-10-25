---
id: 48
title: Run mesh parsing in worker_threads for the extension host
type: feature
priority: P0
effort: M
model: sonnet
area: [mesh]
story: US15
milestone: "VSS:M2"
depends_on: [47, 46]
created: 2026-10-25
---

Node worker adapter that parses and builds the BVH off the host thread and returns transferred buffers.

**Code:** `vsslicer/modules/mesh/src/adapters/worker-node/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Parse and BVH run in a worker on the fixtures
- [ ] A crash is reported as a typed error for one file
- [ ] `ArrayBuffer`s are transferred (detached in the sender)

## Tasks

- [ ] Worker entry
- [ ] Crash handling
- [ ] Tests

## Progress

Not started.
