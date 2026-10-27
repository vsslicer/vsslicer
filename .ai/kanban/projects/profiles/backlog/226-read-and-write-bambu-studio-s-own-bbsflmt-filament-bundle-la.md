---
id: 226
title: "Read and write Bambu Studio's own .bbsflmt filament-bundle layout"
type: bug
priority: P1
effort: M
model: sonnet
area: [importers, export]
sprint: "VSS:SP17"
depends_on: [109]
created: 2026-10-26
---

Found by sp12-rev-prf-109: Bambu Studio writes `.bbsflmt` as `<vendor>/<name>.json` entries under a manifest with `bundle_type: "filament config bundle"`, `filament_name` and a `filament_vendor` list (BambuStudio@79df7ae `src/slic3r/GUI/CreatePresetsDialog.cpp:4170-4245`). Our exporter writes `filament/<name>.json` under a printer config bundle manifest, and `importBambuBundle` refuses a real Studio `.bbsflmt` ("Unknown bundle_type", 0 entities).

**Code:** profile-api's bundle manifest (`vsslicer/modules/common/profile-api/src/domain/bundle/`, layer `domain`) and `vsslicer/modules/profiles/orca/src/adapters/bundles/bambu/` (layer `adapters`). Split the card if the profile-api release must land first.

## Acceptance criteria

- [ ] profile-api parses and builds the filament config bundle manifest
- [ ] `importBambuBundle` reads a `.bbsflmt` in Studio's layout and `exportBambuBundle` writes it, with a fixture built to the cited writer
- [ ] **Bounds:** the vendor list and entry names keep the bundle caps, tested at cap and cap plus one

## Progress

Not started.
