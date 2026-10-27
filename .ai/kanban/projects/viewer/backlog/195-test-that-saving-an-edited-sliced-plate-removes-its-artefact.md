---
id: 195
title: Test that saving an edited sliced plate removes its artefacts
type: feature
priority: P1
effort: S
model: sonnet
area: [plates]
story: US56
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [180, 109, 111]
created: 2026-10-25
---

Edit a sliced Bambu fixture, save, and check the output file.

**Code:** `vsslicer/modules/apps/project/test/integration/stale/` (module: `project-extension`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] The edited plate's G-code, md5, thumbnail and slice_info entries are gone and the notice lists them
- [ ] Other plates keep theirs

## Tasks

- [ ] Test

## Progress

Not started.
