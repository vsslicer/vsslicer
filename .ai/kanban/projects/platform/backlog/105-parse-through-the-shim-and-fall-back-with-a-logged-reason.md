---
id: 105
title: Parse through the shim and fall back with a logged reason
type: feature
priority: P2
effort: M
model: sonnet
area: [web]
story: US52
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [104, 89, 95, 97]
created: 2026-10-25
---

Loads files and meshes with `startWorker` and the Web Worker adapters of `3mf` and `mesh`; on `WorkerStartError` it parses in chunks in the extension host at the lower limit and logs the reason.

**Code:** `vsslicer/modules/apps/project/src/presentation/...` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With a stubbed `WorkerStartError` a small STL still opens and the reason is logged once; a larger one is refused with the message
- [ ] With a working worker, loading runs in workers on both runtimes (tests on each)

## Tasks

- [ ] Use the shim
- [ ] Fallback
- [ ] Tests

## Progress

Not started.
