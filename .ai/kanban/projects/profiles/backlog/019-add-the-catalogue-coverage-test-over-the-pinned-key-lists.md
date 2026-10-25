---
id: 19
title: Add the catalogue coverage test over the pinned key lists
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US8
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [18]
created: 2026-10-25
---

The regression guard that catches an upstream key silently dropped: every key in every pinned list is mapped or native-only.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/` tests (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] Key lists pinned for Orca@09aa0114, Bambu@79df7ae, Prusa@b028299 and @30ef591, SuperSlicer@1f3d287, Cura@5bea2f8; the test fails when a key is unassigned (a deleted entry makes it red)
- [ ] Zero unassigned keys; group counts match the table within the `hidden` allowance
- [ ] Fixtures only (D5)

## Tasks

- [ ] Check in the pinned key lists (names only, with PROVENANCE)
- [ ] Write the coverage test
- [ ] Write the group-count test

## Progress

Not started.
