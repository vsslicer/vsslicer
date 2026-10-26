---
id: 23
title: Read Bambu and Orca plates and slice info
type: feature
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [22]
created: 2026-10-25
---

Reads plates from `model_settings.config` and `plate_N.json`, and slice time, weight and filament from `slice_info.config`, with the plate image and G-code part names.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Plate list, object-to-plate assignment, thumbnail and G-code part names, and slice time and weight match the golden on the Bambu and Orca fixtures
- [x] A plate with no slice info is reported as unsliced, not an error
- [x] Notice and `Ported from` line present

## Tasks

- [x] Plate metadata
- [x] slice_info.config
- [x] Golden checks

## Progress

sp12-vwr-23. Code: `vsslicer/modules/3mf/src/adapters/bambu/readPlates.ts` (new), wired in `readBambu.ts` (project `plates`, `Instance.plateId`, notices); domain types added to `src/domain/project/project.ts` (`Plate` gains optional fields, `PlateInstance`, `SliceInfo`, `SliceFilament`, `SliceWarning`, `PlateLayout`, `PlateObjectBox`); `walk`/`Attrs`/`Handlers` now exported from `readLayerData.ts`. Tests `test/readPlates.test.ts` (29). New real fixture `test/fixtures/real/Elegoo_stringhell.3mf` (has a `plate_1.json`; PROVENANCE.md updated).
Upstream: OrcaSlicer@09aa0114 bbs_3mf.cpp (AGPL-3.0, D2), lines quoted in the file notice. Corpus note: no real sliced Bambu/Orca project exists in `.reference` (every slice_info.config there has no `<plate>`), so the sliced cases are built from Orca's writer (bbs_3mf.cpp:8715-8960). "Golden" = expected values hand-derived from the fixtures' XML/JSON, not from the GUI.
Design: `Plate.slice` absent means unsliced (header-only or missing slice_info.config is not an error). `thumbnail` falls back to the G-code name with `.png` (:1747-1751). `gcodePart` is set only when the package holds the part. Divergence: upstream keeps one instance per object per plate (std::map), we keep all.
Bounds: part 16 MiB, elements 200000, depth 64 (shared `walk`), plates 1024 (model_settings and slice_info), plate_N.json arrays 10000, attribute values 65536 chars, notices 20; Map for all input-keyed config.
Probes (each: change made, then test run, all KILLED): unsliced default slice; plate cap `>=`->`>` (both files); value clip removed; layout array cap `<=`->`<`; thumbnail fallback removed; default `plate_N.gcode` part removed; duplicate plate skip; instance id check; plate-number regex loosened (two ways); locked; pattern_bbox_file; unknown slice plate notice; notice cap; duplicate slice plate; filament check; number notice; plater_id >= 1; missing-plater_id notice; `Instance.plateId` mapping; part size cap; empty-part guard. CI gate platform: ubuntu-latest (Node 24).
Verify: `pnpm lint`, `pnpm build` pass; `pnpm test` 22 files, 355 tests pass; `node scripts/run.mjs checks` pass (check-licence fixed to put Copyright near Ported from).
Release lines:
- CHANGELOG: Added: read Bambu and Orca plates (`Project.plates`: names, lock, instances, thumbnails, G-code part, slice time, weight, filaments, warnings, `plate_N.json` layout); `Instance.plateId` set for Bambu and Orca.
- index.ts exports: `export type { PlateInstance, PlateLayout, PlateObjectBox, SliceFilament, SliceInfo, SliceWarning } from './domain/project/project.ts';` (Plate is already exported). Fixture note: `Elegoo_stringhell.3mf` is test-only (not in `files`).

**Review failed (sp12-rev-vwr-23)**
Ran in `vsslicer/modules/3mf`: `pnpm install`, `pnpm lint` pass, `pnpm build` pass, `pnpm test` 22 files / 358 tests pass (a first run had 1 failure in `resolveProject.test.ts` "8-level fan-out ... without a heap blow-up", a heap-delta assert from another card that is flaky under load; it passed alone and on rerun). `node scripts/run.mjs checks` exit 0.
Checked: goldens in the fixture tests match the fixtures' `model_settings.config`, `slice_info.config` (header only in all three) and `plate_1.json` (unzipped and compared by hand); upstream lines OrcaSlicer@09aa0114 bbs_3mf.cpp:1747-1751 (thumbnail fallback; ours only applies it when the name contains `.gcode`, upstream copies the name either way; harmless), :4738-5003 (`model_instance` metadata), :8574-8606 (writer: `object_id` is the 3MF object id, `instance_id` the index in the object's instances) agree with the port. Layering: domain types pure, adapter only; no cross-module imports. AGPL notice and `Ported from` present. Input-keyed config is a Map; `__proto__`/`constructor` plate keys tested.
AC probes: AC1 goldens (fixture tests) and identifyId zeroed KILLED; AC2 unsliced (tests at :223-266) KILLED per the worker's probe; AC3 by reading.
My probes (temp copy): identifyId zeroed KILLED; `outside` read from `support_used` KILLED; plate value clip removed KILLED; layout array cap removed KILLED; empty-part guard removed KILLED; `locked` dropped KILLED; known keys left in `attributes` KILLED; plate-index `k` replaced by 0 in readBambu SURVIVED; clip removed from `<warning msg>` and `<filament type>` SURVIVED; `isStr` length cap removed SURVIVED; `gcode_file` left in `config` SURVIVED.
Problems:
1. `src/adapters/bambu/readPlates.ts:264-268`: the layout part is parsed once per plate that names it, so `pattern_bbox_file` turns one part into up to 1024 parses. Probe: a 10 MB `big.json` (one large array, compresses to almost nothing) named by 100 plates takes 2050 ms against 26 ms for one plate; 1024 plates and a 16 MiB part block the host for about 35 s. Rule 25: work must be bounded by the input size, not input size times plate count. Fix: read each distinct part once (cache the result by lower-cased part name) and test it without timing, e.g. two plates naming one part parse it once (spy on `JSON.parse`) and both get the layout.
2. `src/adapters/bambu/readBambu.ts:76-84`: the k-th-build-item-to-`instance_id` mapping (object-to-plate assignment, AC1) is untested: replacing `k` with `0` passes every test, because the only check (`readPlates.test.ts:99-103`) has one instance per object. Fix: a test where one object has two build items assigned to plates 1 and 2 (instance_id 0 and 1) and `instances.map(i => i.plateId)` equals `[1, 2]`.
3. `readPlates.ts:120,130-134,139-142,186`: `MAX_VALUE_CHARS` is only tested at the model_settings value site; removing the clip on slice_info values or the `isStr` length check in plate_N.json passes. A bound's test covers each place the bound is applied: add cap / cap+1 cases for a slice_info attribute (e.g. `<warning msg>`) and a plate_N.json string (`bed_type` or a box name).
4. `readPlates.ts:257`: taking `gcode_file` out of `config` is untested (leaving it in passes). Assert `config` is empty in the thumbnail-fallback test at `readPlates.test.ts:128-138`.

**Rework (sp12-vwr-23b)**
1. `readPlates.ts`: layout parts are cached by lower-cased name, so plates naming one part parse it once. Test: two plates naming one part, `JSON.parse` spy called once, both get the layout.
2. `readBambu.test.ts`: one object with two build items on plates 1 and 2 gives `plateId` `[1, 2]`.
3. Cap and cap+1 tests for a slice_info attribute, filament `type`/`color` and `<warning msg>`, and for plate_N.json `bed_type` and box name.
4. Thumbnail-fallback test asserts `config` is empty (`gcode_file` taken out).
Probes (all KILLED): cache guard removed; `k` replaced by 0; clip removed on warning msg, filament type, filament color; `isStr` length cap removed; `gcode_file` left in config.
Verify: `pnpm lint`, `pnpm build` pass; `pnpm test` 22 files, 362 tests pass; `node scripts/run.mjs checks` pass. Release lines unchanged.

**Review passed (sp12-rev2-vwr-23)**
Ran in `vsslicer/modules/3mf`: `pnpm install`, `pnpm lint`, `pnpm build` pass; `pnpm test` 22 files / 362 tests pass; `cd vsslicer && node scripts/run.mjs checks` exit 0.
Previous review's problems, checked against the rework:
1. Fixed. `readPlates.ts:248,275-276` caches layouts by lower-cased part name in a Map, so parse work is bounded by distinct parts (each at most 16 MiB), not part size times plates. Test `readPlates.test.ts:327-345` spies `JSON.parse` (called once) and checks both plates get the layout.
2. Fixed. `readBambu.test.ts:153-170`: one object, two build items, plates 1 and 2 with instance_id 0 and 1, `plateId` `[1, 2]`.
3. Fixed. Cap and cap+1 for the slice_info metadata value, filament `type`/`color`, `<warning msg>` (`readPlates.test.ts:430-447`, exact 65536 asserted) and for plate_N.json `bed_type` and box name (`:347-353`).
4. Fixed. `readPlates.test.ts:137` asserts `config` is empty after the thumbnail fallback.
Probes (temp copy, `readPlates` and `readBambu` tests): cache guard removed KILLED; `k` replaced by 0 KILLED; clip removed on slice_info metadata value KILLED, on warning msg KILLED, on filament type KILLED, on filament color KILLED; `isStr` length cap removed KILLED; `isStr` cap off by one KILLED; `gcode_file` left in config KILLED.
ACs: AC1 goldens and plate assignment (prior review plus probe k0), AC2 unsliced tests (prior review), AC3 notice and `Ported from` present by reading. Layering unchanged: domain types pure, code in adapters, no cross-module imports.
