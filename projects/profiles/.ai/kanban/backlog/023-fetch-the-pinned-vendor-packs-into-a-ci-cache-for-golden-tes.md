---
id: 23
title: Fetch the pinned vendor packs into a CI cache for golden tests
type: chore
priority: P0
effort: S
model: sonnet
area: [importers]
story: US11
milestone: "VSS:M2"
depends_on: [1, PLT-9, PLT-13]
created: 2026-10-25
---

Golden tests need PrusaResearch.ini@b028299, the Orca and Bambu trees, Cura resources and fdm_materials, none of which may be committed; CI downloads them at pinned commits into a cache outside the repository (D4).

**Code:** `vsslicer/fixtures/profile-packs/fetch-packs.ts` and the CI workflow step (layer: n/a (ci))

## Acceptance criteria

- [ ] The script downloads each pack at its pinned commit and verifies a checksum; a second run is a no-op from the cache
- [ ] Offline, tests that need a pack skip with a stated reason; in CI they run (the CI job fails if a pack is missing)
- [ ] Nothing downloaded is inside a tracked path (a git-ignore test)

## Tasks

- [ ] Write the fetch script with checksums
- [ ] Add the CI cache step
- [ ] Add the skip-with-reason helper

## Progress

Not started.
