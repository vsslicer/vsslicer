---
id: 250
title: Slice repaired fixtures with the Orca CLI and check for repair warnings
type: feature
priority: P1
effort: S
model: sonnet
area: [repair]
story: US64
milestone: "VSS:M4"
sprint: "VSS:SP22"
depends_on: [246, 228, SLC-30]
created: 2026-10-25
---

Repairs the fixtures, saves them and slices them through `slicer-orca`.

**Code:** `vsslicer/modules/project-extension/test/integration/repair/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The output has no repair warnings for the repairable fixtures
- [ ] Runs in CI on Linux

## Tasks

- [ ] Harness
- [ ] Check

## Progress

Not started.
