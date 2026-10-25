---
id: 77
title: "Fetch and cache the pinned CuraEngine in the module's CI job"
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US17
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [68, 69, PLT-9, 12]
created: 2026-10-25
---

Installs the pinned CuraEngine on the three runners into a cache keyed by the manifest hash. Extraction per platform is its own CI step.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (ci))

## Acceptance criteria

- [ ] `scripts/fetch-engine.mjs` prints the engine path on ubuntu, macOS and Windows
- [ ] Second run restores from cache without download
- [ ] Engine tests are skipped visibly, not silently, when unset locally

## Tasks

- [ ] Fetch script
- [ ] Cache key
- [ ] Extraction steps in CI

## Progress

Not started.
