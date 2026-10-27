---
id: 26
title: "Fetch and cache the pinned Orca in the module's CI job"
type: chore
priority: P0
effort: S
model: sonnet
area: [orca, engine]
story: US7
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [19, 12, PLT-9]
created: 2026-10-25
---

A script that installs the pinned Orca for the runner's OS into a cache directory keyed by the manifest hash, and exports its path to the tests.

**Code:** `vsslicer/modules/slicer/orca/` (module: `slicer-orca`, layer: n/a (ci))

## Acceptance criteria

- [ ] `scripts/fetch-engine.mjs` installs the pinned Orca on ubuntu, macOS and Windows runners and prints its path
- [ ] A second run restores from the cache and does not download (log assertion)
- [ ] Tests that need the engine are skipped with a visible reason when the variable is unset locally, never silently green in CI

## Tasks

- [ ] Fetch script
- [ ] Cache key
- [ ] Skip rule

## Progress

Not started.
