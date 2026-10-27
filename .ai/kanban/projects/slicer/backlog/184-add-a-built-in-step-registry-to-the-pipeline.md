---
id: 184
title: Add a built-in step registry to the pipeline
type: feature
priority: P2
effort: M
model: sonnet
area: [postprocess]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [111]
created: 2026-10-25
---

Lets pure functions run as steps of the slice pipeline beside external scripts: each step gets the G-code path and the job, runs after the engine and before thumbnails and assembly, and fails by name.

**Code:** `vsslicer/modules/apps/slicer/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] A recording fake step runs between the engine and thumbnail/assembly in the order of registration (test)
- [ ] A failing step stops the chain and leaves `.vsslicer/sliced/` byte-identical; the failure names the step
- [ ] Cancel kills a running step's work; steps can declare "skip" with a reason that appears in the report

## Tasks

- [ ] Step interface
- [ ] Registry and ordering
- [ ] Failure, cancel and skip paths
- [ ] Tests

## Progress

Not started.
