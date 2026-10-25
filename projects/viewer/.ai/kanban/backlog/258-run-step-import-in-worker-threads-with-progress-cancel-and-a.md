---
id: 258
title: "Run STEP import in worker_threads with progress, cancel and a memory cap"
type: feature
priority: P1
effort: M
model: opus
area: [step, mesh]
story: US69
milestone: "VSS:M4"
depends_on: [256]
created: 2026-10-25
---

Runs the import in a worker. The OCCT call is synchronous, so cancel terminates the worker; a memory cap turns an out-of-memory crash into the typed error.

**Code:** `vsslicer/modules/mesh-step/src/adapters/worker/` (module: `mesh-step`, layer: `adapters`)

## Acceptance criteria

- [ ] Progress events arrive for parse and tessellate stages
- [ ] Cancel terminates the worker within 1 s and returns a cancelled outcome
- [ ] A worker crash is reported as the out-of-memory error, and the next import works

## Tasks

- [ ] Worker entry
- [ ] Cancel by terminate
- [ ] Memory cap
- [ ] Tests

## Progress

Not started.
