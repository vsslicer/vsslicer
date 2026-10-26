---
id: 20
title: Fill the 56 mapped keys of profiles.md section 6 with conversions and tests
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US9
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-prf-20
depends_on: [13, 18]
created: 2026-10-25
---

Attaches the catalogue conversions for the 56 keys of the §6 table (90-x support angle, Cura flow x100, elephant-foot sign flip, per-plate bed temperatures) and tests each way.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/mappings/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] All 56 keys convert native to unified and back for Prusa, Orca/Bambu and Cura with the notes of the table as unit tests
- [x] `support_angle` converts 90-x between Prusa/Orca and Cura; `flow_ratio` scales x100 for Cura; `elephant_foot` flips sign for Cura; `bed_temp` maps the five Orca plate keys
- [x] A lossy mapping is flagged with the note text
- [x] Bounds (rule 25): conversions accept native values as strings of at most 64 characters and numbers only when finite; percent-or-absolute parsing is linear (no backtracking regex); a rejected value gives a typed error, not NaN

## Tasks

- [x] Write the mapping table
- [ ] Write the per-key tests

## Progress

Done: `mappings/` in `profile-api` (domain): `values.ts` (bounded parse/format, `MappingError`), `rules.ts` (the 56 unified keys with kind, enum tables, percent bases, notes), `convert-key.ts` (`nativeToUnified`, `unifiedToNative`, `nativeKeys`; both sides are records keyed by native key, so Cura's width/depth/centre and Orca's plate keys use the same call), `index.ts`. Native names and `lossy` notes are read from the catalogue; conversions reuse PRF-13 (`scale`, `sign_flip`, `enum_map`, `percent_of`). Supports orca, bambu, prusa, prusa3, cura. Tests: `test/mappings.test.ts` (298 tests: 56 keys x 5 dialects round trip, each table note, hostile input).

Judgements: (1) Orca@09aa0114 has SIX plate keys (supertack, cool, textured_cool, eng, hot, textured), not five; all six map to surfaces. (2) Prusa/Cura single bed temperature -> every plate (lossy); back -> hot plate first (lossy). (3) `initial_layer_speed` Prusa % base unverified, taken as inner_wall_speed (flagged). (4) Cura `support_structure` belongs to `support_type`, not `support_style`, so `support_style` has no Cura mapping; `support_material_style` -> `support_style` done (Orca default/tree_* write as grid/organic for Prusa). (5) `close_fan_the_first_x_layers` has no Cura mapping (`cool_fan_full_layer` is `full_fan_speed_layer`, PRF-17). (6) Cura bed honours `machine_center_is_zero` and `machine_shape`; `printable_area`/bed_shape split done. (7) Per-extruder keys convert one element; the caller builds the keyed map and splits Prusa "a,b" lists. (8) Bounds: scalars <= 64 chars, finite numbers only, text <= 1 MiB, polygon <= 4096 points of <= 64 chars, lists <= 16; errors are `ConversionError` (not_a_number) or `MappingError` (value_too_long, invalid_value, unsupported, unknown_key); no regex.

Not done: hole-compensation sign and SuperSlicer `filament_pressure_advance` "disabled" (SuperSlicer keys are not among the 56 or the three dialects; encoding of the disabled value unverified); Cura `wipe_tower_x/_y` centre handling (not in the 56). Orca enum lists in the catalogue are partial for gcode_flavor, so unlisted flavours are typed errors.

Verified (vsslicer/modules/profile-api): `pnpm lint` clean, `pnpm test` 707 passed (22 files), `pnpm build` ok. `test/fixtures/catalogue-keys/` untouched.

### Coordinator: shared-file changes
`src/index.ts` add:
```ts
export { MAPPED_KEYS, MappingError, nativeKeys, nativeToUnified, unifiedToNative } from './domain/catalogue/mappings/index.ts';
export type { MappedDialect, NativeRecord, NativeResult, ToNativeOptions } from './domain/catalogue/mappings/index.ts';
```
CHANGELOG: `- Catalogue mappings: native <-> unified conversions for the 56 keys of profiles.md section 6 (Prusa, Orca, Bambu, Cura).`
Review (sp7-rev-prf1920): PASS. 56 keys. Probed: support angle Cura 60 -> 30 and back; Cura material_flow 95 <-> 0.95; elefant_foot sign flip Cura only (lossy note present); six Orca plate keys confirmed in OrcaSlicer@09aa0114 PrintConfig.cpp (supertack, cool, textured_cool, eng, hot, textured, plus _initial_layer); Prusa bed_temperature fans to all plates and back via hot, both lossy with notes; percent 20%. Bounds: 65-char scalar rejected, 64 ok; Infinity, 1e999, '', 'abc', {} give typed ConversionError; __proto__/toString keys unknown_key; text 1 MiB ok, +1 rejected; polygon 4096 ok, 4097 and 1e6-comma strings rejected, 72-char point rejected; 1 MiB 'x' polygon string rejected in 0 ms; no regex. eslint/tsc clean. Card task 'Write the per-key tests' left unticked but test/mappings.test.ts covers it.
