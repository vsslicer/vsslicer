---
id: 15
title: Extend the catalogue with Bambu Studio keys and the bambu. prefix
type: feature
priority: P0
effort: M
model: opus
area: [schema]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [14]
created: 2026-10-25
---

Adds the ~100 Bambu-only keys from `BambuStudio@79df7ae` as `bambu.`-prefixed entries and maps Bambu names that differ from Orca's (`chamber_temperatures`, `machine_max_speed_*`).

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` and `vsslicer/modules/profile-api/src/domain/catalogue/data/bambu.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [x] Every Bambu FFF key (615; 608 measured) is either an Orca-canonical key with a Bambu native name or a `bambu.` entry; none unassigned
- [x] `chamber_temperature` (Orca) and `chamber_temperatures` (Bambu) are one entry with two native names
- [x] Provenance lines for ported text name `BambuStudio@79df7ae:path`

## Tasks

- [x] Extract Bambu keys
- [x] Diff against the Orca set and assign prefixes
- [x] Record native-name differences

## Progress

Done (prf15-worker). PRF-14's `generate()` runs unchanged on `BambuStudio@79df7ae` PrintConfig.cpp/Preset.cpp; new, separate
functions in `tools/catalogue/generate.ts` (section "Bambu Studio (PRF-15)": `BAMBU_NOTICE`, `BAMBU_RENAMES`, `generateBambu`)
assign every key:
- 608 Bambu FFF keys (card said ~615; the only literal `add("...")` not extracted, `filament_extruder_id`, is inside a `/* */` comment at PrintConfig.cpp:5174).
- 498 share Orca's name -> `native.bambu` on the Orca entry (incl. `machine_max_speed_*`, same name in both).
- 14 renamed by Orca's own loader `handle_legacy` (`OrcaSlicer@09aa0114:src/libslic3r/PrintConfig.cpp:9755-9964`), e.g.
  `chamber_temperatures` -> `chamber_temperature`, `prime_tower_rib_width` -> `wipe_tower_rib_width`; the three `*_filament`
  selectors are marked `lossy` (Bambu 1 = Orca 0). Conditional renames (`top_one_wall_type`, `prime_tower_rib_wall`) stay `bambu.`.
- 96 -> `bambu.<key>` entries in `src/domain/catalogue/data/bambu.json`, `native_only: bambu`, AGPL notice, provenance
  `Ported from BambuStudio@79df7ae:src/libslic3r/PrintConfig.cpp:<line>`; exported as `bambuCatalogue`.

Verified: `pnpm install && pnpm lint && pnpm build && pnpm test` in profile-api: 12 files, 272 tests pass. New
`test/catalogue-bambu.test.ts`: schema-valid, counts, chamber mapping, notice/provenance, determinism vs committed data,
cited line defines the key, each rename matches Orca's legacy line, no Bambu FFF key unassigned.

Reviewer check: orca.json now also carries `native.bambu` (512 entries), so PRF-14's determinism test in
`test/catalogue-orca.test.ts` compares against `generateBambu(...).orca` when Bambu's source is present (it fails if only Orca's
source is checked out). Not mapped though similar: `role_base_wipe_speed` vs Orca `role_based_wipe_speed` (no legacy rename in Orca).
Groups/homes of `bambu.` entries come from PRF-14's heuristics against Bambu's preset lists.

Files: `tools/catalogue/generate.ts`, `src/domain/catalogue/bambu.ts` (new), `src/domain/catalogue/data/bambu.json` (new),
`src/domain/catalogue/data/orca.json` (regenerated), `src/domain/catalogue/orca.ts` (comment), `src/index.ts`,
`test/catalogue-bambu.test.ts` (new), `test/catalogue-orca.test.ts`. No dependency or lockfile change.

Changelog: Catalogue covers Bambu Studio 79df7ae: Bambu native names on 512 Orca entries and 96 `bambu.` entries (`bambuCatalogue`).

Review failed (prf15-reviewer): `test/catalogue-orca.test.ts:62-74` (PRF-14's determinism test) fails when only Orca's checkout is present: with `bambu` false `run()` renders Orca's catalogue without `native.bambu`, but the committed `orca.json` carries 512 `native.bambu` names, so `expect(first).toBe(readFileSync(OUTPUT))` fails. A test must skip, not fail, for a missing optional checkout: skip the committed-data comparison (`test.skipIf(!bambu)` or fold `bambu` into the `describe.skipIf`). Everything else verified and holds: lint/build/test pass (12 files, 272 tests); independent grep of BambuStudio@79df7ae PrintConfig.cpp init_common_params..init_extruder_option_keys gives 578 lowercase literals (excluding `filament_extruder_id`, inside `/* */` at :5174) + 3 mixed-case (`required_nozzle_HRC`, `machine_max_force_Y`, `machine_bed_mass_Y`) + 12 axis-loop `machine_max_{speed,acceleration,jerk}_{x,y,z,e}` + 15 `filament_*` override-loop keys = 608, set-equal to the data's 512 `native.bambu` + 96 `bambu.` keys; 15 random same-name shared entries (seed 15) match in type, units and default (differences only Nullable wrappers, `""` vs `()` and an Orca sidetext the regex missed); all 14 renames match Orca's `handle_legacy` at the cited lines (9755-9964); the lossy note is right (Bambu is 1-based with 0 = default, `GCode.cpp:4413` `value - 1`; Orca's loader maps 1 to 0 = inherit). Non-blocking: `wall_filament` maps to `outer_wall_filament_id` only, so a Bambu wall filament no longer reaches Orca's inner walls; the lossy note could say so. PRF-14 holds: 804 entries, line-citation test passes, AGPL notice unchanged; Bambu notice present.

Review fix (prf15-fix): split PRF-14's test into `is deterministic` (always runs) and `matches the committed data` (`test.skipIf(!bambu)`), so an Orca-only checkout skips instead of failing. Added `BAMBU_SOURCE` env override in `tools/catalogue/generate.ts`. Proved: with `BAMBU_SOURCE=/nonexistent` the file gives 7 passed, 1 skipped; with both checkouts the full suite is 273 passed. `wall_filament` lossy note now says inner walls lose Bambu's setting; orca.json/bambu.json regenerated (note text only). Lint/build/test pass.

Review passed (prf15-rereview): lint, build, test 273 passed; BAMBU_SOURCE=/nonexistent gives 268 passed, 5 skipped, 0 failed. Committed-data comparison tests run and pass with both checkouts (data equals regeneration); wall_filament lossy note present in orca.json:9355; entry counts orca 804, bambu 96. Pre-fix data not available without git state access, so 'only the note changed' rests on the equality-to-regeneration tests.
