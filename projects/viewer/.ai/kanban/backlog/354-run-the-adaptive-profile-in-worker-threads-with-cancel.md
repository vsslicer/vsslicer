---
id: 354
title: Run the adaptive profile in worker_threads with cancel
type: feature
priority: P2
effort: S
model: sonnet
area: [mesh]
story: US91
milestone: "VSS:M5"
sprint: "VSS:SP33"
depends_on: [351, 352]
created: 2026-10-25
---

The prepare and adaptive steps run off the host thread with progress and cancel; prepared data is cached per mesh so changing the quality value reruns only the profile step.

**Code:** `vsslicer/modules/mesh/src/adapters/worker-node/layerHeight.ts` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Changing the quality value on a prepared 1 M triangle mesh returns in under one second (recorded)
- [ ] Cancel returns without a partial profile
- [ ] The host event loop is not blocked more than 50 ms

## Tasks

- [ ] Worker entry
- [ ] Cache
- [ ] Tests

## Progress

Not started.
