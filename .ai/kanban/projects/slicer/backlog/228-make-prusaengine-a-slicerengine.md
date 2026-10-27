---
id: 228
title: Make `PrusaEngine` a `SlicerEngine`
type: feature
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US66
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [220, 223, 224, 227, 7]
created: 2026-10-25
---

Composes emit, run and verify behind the `slicer-api` interface; progress is indeterminate because the CLI prints none.

**Code:** `vsslicer/modules/slicer/prusa/src/application/...` (module: `slicer-prusa`, layer: `application`)

## Acceptance criteria

- [ ] The contract suite of `slicer-api` passes against the adapter with a stub binary
- [ ] Progress events are indeterminate and cancel works through the interface
- [ ] Warnings from stderr reach the job's warning stream

## Tasks

- [ ] Compose
- [ ] Contract suite run
- [ ] Progress and cancel

## Progress

Not started.
