---
id: 90
title: Re-slice saved fixture projects with the pinned Orca CLI in CI
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [87, 88, 10, SLC-30, GCP-7]
created: 2026-10-25
---

Edits each Bambu and Orca fixture with a scripted set of operations (rename, move, delete), saves it with `writeProject` and slices it with the pinned Orca CLI through `slicer-orca`; the parser reads the output.

**Code:** `vsslicer/modules/3mf/test/integration/reslice/` (module: `3mf`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Plate count and object names in the output equal those of the saved project, for every fixture
- [ ] Runs in CI on Linux; engine and parser versions are printed in the log
- [ ] Verified on the Orca CLI and fixtures only (D5)

## Tasks

- [ ] Scripted edit set
- [ ] Slice and parse harness
- [ ] CI job

## Progress

Not started.
