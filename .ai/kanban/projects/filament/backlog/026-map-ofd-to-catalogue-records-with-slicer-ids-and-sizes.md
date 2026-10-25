---
id: 26
title: Map OFD to catalogue records with slicer ids and sizes
type: feature
priority: P1
effort: M
model: sonnet
area: [import]
story: US7
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [25]
created: 2026-10-25
---

OFD brand > material > filament > variant plus `sizes.json` (weight, diameter, EAN, article number, spool dimensions) into `CatalogueRecord`s. `slicer_ids` from `slicer_settings.{bambustudio,orcaslicer}.{id,generic_id}` and prusaslicer and cura.

**Code:** `vsslicer/modules/filament-ofd/src/domain/...` (module: `filament-ofd`, layer: `domain`)

## Acceptance criteria

- [ ] Counts of brands, materials, filaments and variants match the pinned snapshot's own index
- [ ] The Bambu PLA sample has `slicer_ids.bambu = "GFA16"` and generic `GFL99`; Orca, Prusa and Cura ids are mapped
- [ ] `moved_from` is carried (`OFD@eef61a50:docs/manual.md:39-51`); data stays MIT with the source recorded on each record

## Tasks

- [ ] Write the mapper
- [ ] Count and id tests

## Progress

Not started.
