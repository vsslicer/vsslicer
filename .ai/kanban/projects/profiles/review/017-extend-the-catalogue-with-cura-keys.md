---
id: 17
title: Extend the catalogue with Cura keys
type: feature
priority: P0
effort: M
model: opus
area: [schema]
story: US7
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-17-fix
depends_on: [14]
created: 2026-10-25
---

Maps `Cura@5bea2f8:resources/definitions/fdmprinter.def.json` and `fdmextruder.def.json` (740 + 31 keys) onto canonical names, or `cura.` entries where none exists; `=expr` values are stored as `{expr}`.

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` and `vsslicer/modules/profile-api/src/domain/catalogue/data/cura.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [x] Every Cura setting key is mapped or `native_only`; extruder-scoped keys are flagged per-extruder
- [x] Cura-only material properties from the XML key table (density, diameter, GUID) land in `material` entries, not settings
- [x] Formula defaults are kept verbatim and flagged `expr`
- [x] Bounds (rule 25): the Cura generator refuses a definition file over 16 MiB and settings nested deeper than 32 levels, and runs no upstream code; formulas are stored verbatim, never evaluated

## Tasks

- [x] Extract the definitions
- [x] Map to canonical names
- [x] Flag per-extruder and `expr` keys

## Progress

Done by sp7-prf-17, review FAIL fixed by sp7-prf-17-fix.

- Generator `tools/catalogue/cura.ts` (imports only `render` from generate.ts) reads `Cura@5bea2f8` `fdmprinter.def.json`, `fdmextruder.def.json` (as JSON) and the XML key table in `plugins/XmlMaterialProfile/XmlMaterialProfile.py` (as text). Output `src/domain/catalogue/data/cura.json`: `notice` (LGPL-3.0 + CC0), `entries` (622 `cura.` entries, `native_only: cura`, provenance `Cura@5bea2f8:<file>:<line>`), `names` (138 Cura names of Orca keys from `CURA_NAMES` + `CURA_SPLITS`, with `lossy` notes and scale/sign_flip/split conversions; enum maps, percent-of and bed-shape conversions left to PRF-20), `per_extruder` (614 Cura keys), `material` (XML path -> Material field for GUID/brand/material/diameter/density, -> unified setting key for the 24 `<setting key>` names). 762 keys assigned once (622 entries + 140 keys in 138 names). 290 entry defaults are `{expr}` (Cura `value` kept verbatim); expression bounds are dropped, not evaluated.
- Fix round (review FAIL):
  1. Rule 25: `lineOf` (quadratic `indexOf` from offset 0 per setting) replaced by `keyLines(text)`, one linear pass that tokenises JSON strings (escapes included) and records the first `"key": {` line per key; cited lines are unchanged on the pinned sources (0 provenance diffs). New tests: 100k flat settings extract under 2 s (the old scan took ~19 s at 40k), and a `\"b\": {` inside a description is not cited as b's line.
  2. Mappings, each checked against `fdmprinter.def.json` labels/descriptions and orca.json: `cool_fan_full_layer` -> `full_fan_speed_layer` (was `close_fan_the_first_x_layers`); `xy_offset_layer_0` sign flip gets a lossy note (exact only when `xy_offset` is 0). Added: `speed_topbottom` -> `top_surface_speed` (lossy: top and bottom), `speed_z_hop` -> `travel_speed_z`, `jerk_print`/`jerk_wall_0`/`jerk_wall_x`/`jerk_infill`/`jerk_travel`/`jerk_layer_0`/`jerk_topbottom` -> `default_jerk`/`outer_wall_jerk`/`inner_wall_jerk`/`infill_jerk`/`travel_jerk`/`initial_layer_jerk`/`top_surface_jerk`, `cool_min_layer_time_fan_speed_max` -> `fan_cooling_layer_time` (lossy: above the threshold Cura runs the regular fan speed, Orca turns the fan off), `skin_overlap` -> `top_bottom_infill_wall_overlap` (lossy: Cura percent of skin and innermost wall widths, Orca of the inner wall width), `prime_tower_position_x/_y` -> `wipe_tower_x/_y` (lossy: Cura X is the tower's right edge, `CuraEngine@47b0388:src/PrimeTower/PrimeTower.cpp:42` centres it at (x - r, y + r), Orca's is the corner; Orca holds one value per plate), and the split `printable_area` <- [`machine_width`, `machine_depth`] (lossy note: PRF-20 converts to the polygon).
  3. PROVENANCE rows below use `repo@commit:path:line` licence cites.
- Loader `src/domain/catalogue/cura.ts`: `curaCatalogue`, types `CuraCatalogueFile`, `CuraMaterialKey`.
- Files changed in the fix round: `tools/catalogue/cura.ts`, `test/catalogue-cura.test.ts` (16 tests; entry `{expr}` count 300 -> 290 because 10 newly mapped keys carry formulas), `src/domain/catalogue/data/cura.json` (regenerated: `node tools/catalogue/cura.ts`).
- Verified: `pnpm test` 19 files / 366 tests pass (determinism test green); `pnpm build` ok; `eslint .` and `tsc --noEmit -p tsconfig.test.json` clean; `prettier --check` clean on my files. `pnpm lint` fails only on `prettier --check` of `tools/catalogue/generate.ts`, which this card did not touch (PRF-16's agent is editing it).
- Not done: `names` are not merged into orca.json `native.cura` (moved to PRF-18; orca.json is written only by generate.ts). Groups/homes of `cura.` entries come from Cura's category plus key patterns (shortcut, commented). Not checked by a lawyer: LGPL-3.0 data inside the AGPL package.

### Coordinator: shared-file changes

- `src/domain/catalogue/index.ts`: `export type { CuraCatalogueFile, CuraMaterialKey } from './cura.ts';`
- `src/index.ts`: `export { curaCatalogue } from './domain/catalogue/cura.ts';`
- `package.json`: no change needed (optional script `"catalogue:cura": "node tools/catalogue/cura.ts"`).
- `CHANGELOG.md`: `- Cura catalogue data (PRF-17): cura.json with 622 cura. entries, Cura names of 138 Orca keys, per-extruder keys and the fdm_materials XML key table, generated by tools/catalogue/cura.ts; Cura formulas kept as {expr}.`
- `PROVENANCE.md`, rows under "Other slicers":
  | `cura.json` (622 entries, 138 names) | [Cura](https://github.com/Ultimaker/Cura) | `5bea2f86153faed3a1c2d9081b8d6b753684678a` | `resources/definitions/fdmprinter.def.json`, `resources/definitions/fdmextruder.def.json`, `plugins/XmlMaterialProfile/XmlMaterialProfile.py` | LGPL-3.0 (`Cura@5bea2f8:LICENSE:1`, the LGPL v3 text; no "or later" grant found) |
  | `cura.json` `material` density citation | [fdm_materials](https://github.com/Ultimaker/fdm_materials) | `0c0596974a58fa622eeaa2bebced433a7860ac4b` | `generic_pla.xml.fdm_material` (line 21 only cited) | CC0-1.0 (`fdm_materials@0c05969:README.md:28`) |
  | `cura.json` `names` prime-tower note (cited, nothing copied) | [CuraEngine](https://github.com/Ultimaker/CuraEngine) | `47b0388` | `src/PrimeTower/PrimeTower.cpp:42` | AGPL-3.0 |
  Copied from Cura: setting labels, descriptions, defaults, formulas, bounds, units and enum options, Copyright (C) Ultimaker B.V. LGPL-3.0 data can be conveyed under (A)GPL-3.0 terms, so the package licence question stays Q20's (AGPL-3.0-only parts).
