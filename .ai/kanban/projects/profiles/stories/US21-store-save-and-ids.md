---
id: US21
title: "A consumer saves diff-only user profiles and finds materials by external id"
status: reviewed
epic: VSS:E13
---

The calibration epic and the filament inventory save edits through `ProfileStore.update` and look materials up by Bambu, Orca, Prusa or Cura ids.

## Acceptance criteria

- [ ] A saved user entity stores only changed keys, the parent id and the parent version
- [ ] `update(id, patch)` changes only the named keys
- [ ] `findMaterialByExternalId` finds a material by each of the four id kinds

## Out of scope

- Three-way vendor upgrade UI (E57).
