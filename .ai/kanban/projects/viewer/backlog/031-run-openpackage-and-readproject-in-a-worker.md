---
id: 31
title: Run openPackage and readProject in a worker
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US8
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [20]
created: 2026-10-25
---

Wraps the library in a `worker_threads` worker for the extension host and a Web Worker for the webview, with transferable results and per-file crash handling.

**Code:** `vsslicer/modules/3mf/src/adapters/worker/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The same library runs in both workers on a fixture
- [ ] A crash or out-of-memory in the worker is reported as a typed error for that file only
- [ ] Results are transferred, not copied

## Tasks

- [ ] Node worker entry
- [ ] Web Worker entry
- [ ] Crash handling test

## Progress

Not started.
