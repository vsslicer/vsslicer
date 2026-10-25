---
id: 86
title: Remove stale plate artefacts and list them in the save notice
type: feature
priority: P1
effort: S
model: sonnet
area: [3mf]
story: US31
milestone: "VSS:M4"
depends_on: [85, 23]
created: 2026-10-25
---

When a plate's content changed, its G-code, md5, plate thumbnails and `slice_info` entries are removed from the output and listed in a `SaveNotice`.

**Code:** `vsslicer/modules/3mf/src/application/writer/` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] Editing an object on plate 2 of a sliced Bambu fixture removes plate 2's artefacts only and lists them
- [ ] Plates with unchanged content keep theirs
- [ ] The notice names each removed part

## Tasks

- [ ] Staleness rule per plate
- [ ] Removal in the plan
- [ ] Tests

## Progress

Not started.
