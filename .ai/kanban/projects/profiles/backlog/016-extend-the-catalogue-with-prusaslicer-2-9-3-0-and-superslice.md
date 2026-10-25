---
id: 16
title: "Extend the catalogue with PrusaSlicer 2.9, 3.0 and SuperSlicer keys"
type: feature
priority: P0
effort: L
model: opus
area: [schema]
story: US6
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [14]
created: 2026-10-25
---

Maps PrusaSlicer `@b028299` (471 keys plus 178 legacy-only) and the 3.0 `@30ef591` definitions, plus SuperSlicer `@1f3d287` (893 keys, `.ui` groups), onto the canonical Orca names; keys with no Orca equivalent keep `prusa.` or `superslicer.` prefixes (D9).

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` and `vsslicer/modules/profile-api/src/domain/catalogue/data/prusa.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [ ] Every key of each pinned list is mapped to a canonical entry (with native name) or marked `native_only` with its dialect
- [ ] Prusa-only keys carry `prusa.`; SuperSlicer-only keys carry `superslicer.`; Prusa 3.0 hardware namespace keys are tagged as pinned-to-`@30ef591` so a schema change fails a pinned test
- [ ] Legacy-only Prusa keys are present and flagged `legacy`

## Tasks

- [ ] Extract Prusa 2.9 and 3.0 key lists
- [ ] Extract SuperSlicer keys and `.ui` groups
- [ ] Assign canonical names and prefixes
- [ ] Pin the 3.0 keys with tags

## Progress

Not started.
