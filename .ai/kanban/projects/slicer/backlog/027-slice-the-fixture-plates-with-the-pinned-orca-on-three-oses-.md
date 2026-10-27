---
id: 27
title: Slice the fixture plates with the pinned Orca on three OSes and check the result
type: chore
priority: P0
effort: M
model: sonnet
area: [orca, engine]
story: US7
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [25, 26, 1, GCP-3, GCP-4, 10]
created: 2026-10-25
---

The I5 CI exit criterion for Orca: real engine, fixture plates, parsed by `@vsslicer/gcode`; plus cancel on a large fixture.

**Code:** `vsslicer/modules/slicer/orca/` (module: `slicer-orca`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Linux: every fixture plate slices; `--pipe` progress reaches 100; `result.json` is read; the parser reports the layer count and roles in `expected.json`
- [ ] macOS and Windows: the slice completes with indeterminate progress
- [ ] Cancel during a slice of a large fixture kills the process tree within 2 s and leaves no output (pinned Orca, CI)
- [ ] Engine and parser versions are printed in the CI log

## Tasks

- [ ] Integration test file
- [ ] Large fixture
- [ ] Cancel test

## Progress

Not started.
