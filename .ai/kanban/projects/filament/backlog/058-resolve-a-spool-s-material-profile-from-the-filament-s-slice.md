---
id: 58
title: "Resolve a spool's material profile from the filament's slicer ids"
type: feature
priority: P1
effort: M
model: sonnet
area: [ui]
story: US27
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [16, PRF-140]
created: 2026-10-25
---

Using `findMaterialByExternalId` (`@vsslicer/profiles`): one match links automatically, several or none (or a generic `GFL99`) ask the user; absent profiles yield an "install" result. Id kinds: Bambu `filament_id`, Orca id, Prusa name, Cura GUID.

**Code:** `vsslicer/modules/filament-extension/src/application/...` (module: `filament-extension`, layer: `application`)

## Acceptance criteria

- [ ] On profile fixtures imported from Orca, Bambu, PrusaSlicer and Cura, each of the four id kinds resolves; OFD Bambu PLA Basic links to the `GFA00` material, generic `GFL99` asks
- [ ] With no lookup available the result is `profilesMissing`; the link stays empty
- [ ] The id kinds match PRF's `findMaterialByExternalId` (checked against its fixtures)

## Tasks

- [ ] Write the resolver
- [ ] Fixture tests

## Progress

Not started.
