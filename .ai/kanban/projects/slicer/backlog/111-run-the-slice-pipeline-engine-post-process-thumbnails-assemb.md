---
id: 111
title: "Run the slice pipeline: engine, post-process, thumbnails, assemble, commit"
type: feature
priority: P0
effort: L
model: opus
area: [engine, postprocess]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP23"
depends_on: [107, 54, 14, 110, 42, 102, VWR-63]
created: 2026-10-25
---

The use case behind `Slicer.slice`: engine, then post-processing scripts, then `writeSlicedOutput`, then an atomic commit into `.vsslicer/sliced/`. Any failing step stops the chain and leaves the sliced folder unchanged.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] Order is engine, post-process, thumbnails and assembly, commit (test with a recording fake for each step)
- [ ] A failure at each step leaves `.vsslicer/sliced/` byte-identical (test per step)
- [ ] Cancel at each step kills what is running and leaves nothing
- [ ] Warnings from every step are collected in one report returned to the caller

## Tasks

- [ ] Pipeline
- [ ] Failure matrix
- [ ] Cancel matrix
- [ ] Report

## Progress

Not started.
