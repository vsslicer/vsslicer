---
id: 24
title: Read Bambu and Orca layer data and cut information
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [22]
created: 2026-10-25
---

Reads `custom_gcode_per_layer.xml`, `layer_config_ranges.xml`, `layer_heights_profile.txt` and `cut_information.xml` into the Project; unknown attributes stay raw.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Each file on the fixtures yields the golden structure; a missing file is fine
- [x] Notice and `Ported from` line present

## Tasks

- [x] Four readers
- [x] Golden checks

## Progress

Done by sp11-vwr-24. Files: `src/adapters/bambu/readLayerData.ts` (new, notice and `Ported from` line present), wired in `readBambu.ts`;
`src/domain/project/project.ts` gains `customGcodes`, `layerRanges`, `layerHeightProfiles`, `cuts` (default `[]`) and their types; tests in `test/readLayerData.test.ts`.

Fixtures: pa_pattern.3mf (custom_gcode_per_layer.xml with 4 layers, cut_information.xml) and auto_pa_line_single.3mf (4 cut objects) are real goldens.
No fixture holds layer_config_ranges.xml or layer_heights_profile.txt for Bambu/Orca, so those two are tested on synthetic parts that follow the upstream parser (:3053, :2991).
A bad part is a notice and is kept in `preserved`, never a throw. Bounds: 16 MB per part, 200k elements/profile values per part, depth 64, notices capped at 20.

Verification (macOS; CI gate runs ubuntu): `pnpm lint` ok, `pnpm build` ok, `pnpm test` 20 files / 309 tests ok, `node scripts/run.mjs checks` ok.

Mutation probes (each made the named test fail): legacy gcode mapping, plate without plate_info, profile `<= 4`, profile odd count, notice cap, element cap, depth cap, equal-bounds range merge, part size cap, duplicate cut object, profile value budget, connector unknown-attribute split, loose-layer drop when plates exist (found by a first survivor, test added).

Release lines:
- CHANGELOG: `Bambu and Orca projects expose custom G-code per layer (per plate), layer config ranges, layer height profiles and cut information (Project.customGcodes, layerRanges, layerHeightProfiles, cuts).`
- index.ts exports: `export type { CustomGcode, PlateCustomGcodes, LayerRange, LayerHeightProfile, CutConnector, CutInfo } from './domain/project/project.ts';`
- Note: `test/support/projectJson.ts` was not extended (shared with card 023's golden); the layer data is checked in `test/readLayerData.test.ts`.

**Carried to SP12 (sp11-coordinator, 14:26):** built and in review, but no reviewer could be dispatched (the permission classifier refused the review dispatches, Q29). The unreviewed work is parked, untracked, under `.ai/local/wip/SP11/` at the same paths; copy it back before the review. Its release lines above still apply. Nothing of it is committed.

**Review failed (sp12-rev-vwr-24)**

Ran in `vsslicer/modules/3mf` (parked work already copied back): `pnpm install` ok, `pnpm lint` ok, `pnpm build` ok, `pnpm test` 20 files / 309 tests ok, `node scripts/run.mjs checks` ok.
Upstream lines checked against `.reference/repos/OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (:235-250, :2015-2022, :2062, :2083, :2718-2775, :2991-3050, :3053-3098, :3414-3500) and `CustomGCode.hpp:17-25`: the port matches (plate_info plates, loose layers to plate 1 only without plates, legacy `gcode` mapping, equal-bounds merge, profile `<= 4`/odd rule, invalid and duplicate ids). Layering ok (adapters import domain and `opc/xml.ts` only), notice and `Ported from` present. Golden criterion ok on pa_pattern.3mf and auto_pa_line_single.3mf; missing files ok on booleans_operations.3mf.

Probes (temp copy): notice cap 20, legacy fallback type, case-insensitive part lookup and part-size constant were killed. Survived: `++elements >= MAX_LAYER_ENTRIES`, `MAX_LAYER_ENTRIES = 1000`, `part.bytes.length >= MAX_LAYER_PART_BYTES`, depth cap `> 90`, profile budget `>=`, and `text = t` in place of `text += t` (minor, not counted below).

Problems:
1. `src/adapters/bambu/readLayerData.ts:78,98`: `LEGACY_TYPE` is a plain object keyed by input. A pre-2.2 `<layer gcode="__proto__">` gives `type` = `Object.prototype`, `gcode="constructor"` or `"toString"` gives a function, in a field typed `number`, and `extra` is `''`. No notice. Upstream (:3443-3447) makes every unknown gcode `Custom` (4) with `extra = gcode`. Probe: `<custom_gcodes_per_layer><layer top_z="1" extruder="1" color="" gcode="constructor"/></custom_gcodes_per_layer>` returns `typeof type === 'function'`. Fix: an input-keyed lookup must not reach the prototype. Use a `Map` or `Object.hasOwn`, and add a test for `__proto__`, `constructor` and `toString` that expects `[4, gcode]`. Attributes are fine: saxes uses null-prototype objects and `__proto__`/`constructor` attributes stay raw.
2. `test/readLayerData.test.ts:208-223,231-239`: the bound tests do not pin the caps (SP12 rule: a bound's test asserts the exact cap, and the expected value must not come from the code under test). The tests build their inputs from the imported `MAX_LAYER_ENTRIES`/`MAX_LAYER_PART_BYTES` and overshoot by a margin (depth 100 against 64, 200001 elements, 200004 values), so off-by-one mutations and `MAX_LAYER_ENTRIES = 1000` all pass. Fix: write the literals in the test (200000, 16777216, 64), assert that exactly the cap passes and cap+1 gives the notice, for elements, part bytes, depth and profile values, and assert the cap number in the notice text.

**Rework (sp12-vwr-24)**

1. `LEGACY_TYPE` is now a `Map` (`LEGACY_TYPE.get(gcode) ?? 4`); test `legacy gcode names that are Object.prototype keys become custom G-code` covers `__proto__`, `constructor`, `toString` and expects `[4, gcode]`.
2. Bound tests rewritten with literals (200000, 64, 16777216): cap read with no notice, cap+1 gives a notice carrying the cap number. Elements: 199999 objects plus root pass, 200000 fail. Profile values: total is always even (each profile needs an even count), so 200000 passes and 200002 is refused.

Probes (all restored; each fails its test): `++elements >=`, `MAX_LAYER_ENTRIES = 1000`, `bytes.length >=`, depth cap `> 90`, profile budget `>=`, `LEGACY_TYPE[gcode]` object lookup (2 tests fail). Criteria: golden structure and notice/Ported-from unchanged (real-fixture tests still pass).

Verification (macOS; CI gate runs ubuntu): `pnpm lint` ok, `pnpm build` ok, `pnpm test` 20 files / 313 tests ok, `node scripts/run.mjs checks` ok. Release lines unchanged.

**Review passed (sp12-rev2-vwr-24)**

Ran in `vsslicer/modules/3mf`: `pnpm install` ok, `pnpm build` ok, `pnpm test` 20 files / 313 tests ok, `node scripts/run.mjs checks` ok (exit 0). `pnpm lint` fails only on `test/large/case.ts` (Prettier), which is untracked, being edited at the time of the review, and belongs to VWR-32, not to this card; on this card's files `eslint src test/readLayerData.test.ts` ok, `prettier --check src test/readLayerData.test.ts` ok, `tsc --noEmit -p tsconfig.test.json` ok.

Previous problems:
1. Fixed. `readLayerData.ts:78-82,102`: `LEGACY_TYPE` is a `Map`, `get(gcode) ?? 4`; the new test covers `__proto__`, `constructor`, `toString` and expects `[4, gcode]`. The plain-object lookup put back fails it.
2. Fixed. The bound tests use the literals 200000, 64 and 16777216. Each one checks that the cap is read with no notice, that the cap plus one gives a notice, and that the notice carries the cap number. For the profile values the next even total is 200002, which is right because every valid profile has an even count. The notice cap test pins 20 through `and 80 more notices`.

Mutation probes (temp copy, `test/readLayerData.test.ts`), all killed: elements `>=` and `> cap+1`, `MAX_LAYER_ENTRIES = 1000` (2 tests), part bytes `>=` and `> cap+1`, depth `>=` and `> 65`, profile values `>=` and `> cap+2`, plain-object `LEGACY_TYPE` lookup, `MAX_NOTICES = 21`. One survives: `text = t` for `text += t`. It is minor and was already left uncounted in the last review. Saxes splits option text around a comment, and a hostile probe shows `a<!--c-->b` reads as `ab`, so the code is right but nothing tests it.

Hostile probes: an `opt_key="__proto__"`/`"constructor"` option and `__proto__`/`constructor` connector attributes stay raw in Maps, and `Object.prototype` is left untouched. `plate_info id="__proto__"` gives a notice. An 11-digit `object_id` gives a notice. CRLF profile lines are read. DTD entity definitions are refused with a notice. Remark, not a blocker: a CDATA option value reads as `''` (no `cdata` handler). Upstream's ptree would read it, but Orca never writes CDATA there.

Criteria: golden structure on pa_pattern.3mf and auto_pa_line_single.3mf, missing files fine on booleans_operations.3mf (real-fixture tests pass); notice and `Ported from` present. Upstream legacy mapping re-checked at `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp:3441-3452`. Layering unchanged (adapters import domain and `opc/xml.ts` only).
