---
id: 223
title: Key per-extruder settings by extruder in the Orca and Bambu importers
type: bug
priority: P1
effort: M
model: sonnet
area: [importers]
sprint: "VSS:SP14"
created: 2026-10-26
---

Found by sp12-rev-prf-106: settings from the Orca and Bambu importers (bundle and folder) fail the profile-api schema on per-extruder keys such as `nozzle_diameter` and `nozzle_temperature`: the schema wants them keyed by extruder, the importers pass raw arrays. `decodeVariants` exists but no import path uses it, and no profiles-orca test validates against `entitySchemas`.

**Code:** `vsslicer/modules/profiles/orca/src/adapters/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] Every entity from the folder, `.orca_*` and `.bbscfg`/`.bbsflmt` importers validates against profile-api's `entitySchemas` (ajv) on the real fixtures, in a test
- [ ] Per-extruder keys are keyed by extruder through `decodeVariants`
- [ ] **Bounds:** extruder count stays capped, with a cap and cap-plus-one test

## Progress

Not started.
