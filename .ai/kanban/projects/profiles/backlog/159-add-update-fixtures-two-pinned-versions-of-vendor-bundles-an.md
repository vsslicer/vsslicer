---
id: 159
title: "Add update fixtures: two pinned versions of vendor bundles and user edits"
type: chore
priority: P2
effort: M
model: sonnet
area: [store]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP39"
depends_on: [144]
created: 2026-10-25
---

Small synthetic vendor trees in the Prusa, Orca and Cura shapes at two pinned versions (v1, v2) with added, changed, removed and renamed presets, and user entities with `meta.base_version` = v1 that do and do not collide with the v2 changes.

**Code:** `vsslicer/modules/profiles/test/fixtures/updates/` (module: `profiles`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] PROVENANCE.md says the trees are synthetic and shaped like the real ones; sizes are under the fixtures cap
- [ ] The fixtures include a case for each three-way outcome: user-only change, vendor-only change, both change the same key equally, both change it differently, vendor removes a preset the user inherits

## Tasks

- [ ] Build the trees
- [ ] User entities
- [ ] PROVENANCE

## Progress

Not started.
