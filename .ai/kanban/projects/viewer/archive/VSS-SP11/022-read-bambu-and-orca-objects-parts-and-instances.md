---
id: 22
title: "Read Bambu and Orca objects, parts and instances"
type: feature
priority: P0
effort: M
model: opus
area: [3mf]
story: US5
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [21]
created: 2026-10-25
---

Ports `model_settings.config` object, part and instance parsing, with per-object metadata.

Ported from `OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` and `BambuStudio@79df7ae:src/libslic3r/Format/bbs_3mf.cpp` (AGPL-3.0, D2).

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [x] Objects, parts (including modifiers and negative volumes), instances and per-object metadata match a golden JSON hand-checked against the file's own model and `model_settings.config` XML (settled by the coordinator, as for VWR-25; the GUI check is carried in its own card, Q28)
- [x] Painting attributes are kept as raw per-triangle strings
- [x] Notice and `Ported from` line present

## Tasks

- [x] Port object and part parsing
- [x] Instances and transforms
- [ ] Golden JSON and hand-check
- [x] Tests

## Progress

Not started.

### sp11-vwr-22 (2026-10-26)

**Done.** `src/adapters/bambu/readObjects.ts` (new): `readModelSettings` (model_settings.config objects, `<part>`/`<volume>`
with `subtype`, metadata to the open part or the object; plate metadata and keyless metadata skipped; metadata/parts
outside an object and duplicate ids refused) and `readBambuObjects` (one object per build-item target, more items are
more instances; leaves found breadth first through components with composed transforms, components win over an own mesh,
empty meshes and missing targets skipped with a notice; part matched by `<part id>` = leaf object id, same position first;
names, `_2` fallbacks, `Object_<n>`; singular/non-finite item transforms at identity; lone-part offset folded into the
instances). `readBambu.ts` now takes objects from it: `createBambuReader(dialect)` (the `readCore` argument is gone;
`src/readProject.ts` and `test/readBambu.test.ts` updated, 2 lines each). Painting: `readModel` keeps every triangle
attribute other than v1-v3/pid/p1-p3 raw per triangle ('' where absent) in `CoreObject.triangleAttributes` (cap 16
names per object, rule 25); parts carry it as `ModelPart.triangleAttributes`, shared, not copied. New optional domain
fields: `ModelPart.subtype`, `ModelPart.triangleAttributes`, `CoreObject.triangleAttributes` (additive; VWR-78/292 type them).
Ported from OrcaSlicer@09aa0114 bbs_3mf.cpp (lines in the file header), checked against BambuStudio@79df7ae; AGPL notice in
the file. Notes: `.reference/notes/VWR-22-bambu-orca-objects.md`.

**Golden:** `test/fixtures/real/auto_pa_line_single.3mf` (BambuStudio@79df7ae `resources/calib/pressure_advance/`, AGPL-3.0,
PROVENANCE.md line added) and `auto_pa_line_single.golden.json` (4 objects x normal_part + modifier_part, per-object
`extruder`, part config as written, 4 instances). Hand-checked against the file's `3D/3dmodel.model` and
`Metadata/model_settings.config`; **not checked in the Bambu Studio / Orca GUI** (no GUI here), so criterion 1 stays
unticked: someone needs to open the fixture in Bambu Studio 2.x and compare the object list (names, part types, extruders,
positions). Negative volumes, support enforcers and paint are covered only by synthetic tests: no real Bambu/Orca file
in `.reference` has `negative_part` or `paint_*` (VWR-10 captures real ones). Sweep of every Bambu/Orca 3MF under
`.reference/repos/*/resources`: all read as bambu/orca with no fallback notice; OrcaBadge.3mf carries `face_property`.

**Not ported (shortcut, in the doc comment):** inside-out flipping, `mesh_shared` reuse, `extruder` clamping (:2376-2400),
the third-party instance split (:2141-2181), pid colour to `extruder`; singular check is exact zero, not Eigen's pivot threshold.

**Verification (macOS, Node 24; CI gate runs ubuntu-latest):** 3mf `pnpm install` ok, `pnpm lint` clean, `pnpm build` ok,
`pnpm test` 18 files / 290 tests pass; `node scripts/run.mjs checks` exit 0 (runner tests 84/84, check-licence, check-fixtures).

**Mutation probes (each restored):** plate skip removed: killed (suite fails at collection); keyless skip: killed;
duplicate-id check: killed; part close reset: killed; ranged-volume rule: killed; singular-transform guard: killed;
lone-part move: killed; `Object_<n>` name: killed; `_n` renames: killed; missing-target notice: killed; components-win
rule: killed (after tightening the test to check vertex count); empty-mesh skip: killed; subtype: killed; paint to part:
killed; object `name` kept out of config: killed; readModel attribute cap: killed; end padding: killed; core-attribute
exclusion: killed; mid padding: killed; component budget removed: killed (cycle test runs out of heap, 512 MB).
Not probed: "same position first" part matching (equivalent to the search unless part ids repeat).

Release lines:
- CHANGELOG: `- VWR-22: Bambu/Orca objects, parts and instances (`readBambuObjects`, `readModelSettings`): `model_settings.config` object and part metadata, part `subtype` (modifiers, negative volumes, enforcers, blockers), per-object config, one instance per build item; `readModel` keeps raw per-triangle attributes (painting) in `CoreObject.triangleAttributes`, carried to `ModelPart.triangleAttributes`. `createBambuReader` now takes only the dialect.`
- src/index.ts:
  `export { MAX_COMPONENTS, MODEL_SETTINGS, readBambuObjects, readModelSettings } from './adapters/bambu/readObjects.ts';`
  `export type { ObjectSettings, PartSettings } from './adapters/bambu/readObjects.ts';`
  and `MAX_TRIANGLE_ATTRIBUTES` added to the existing `readModel` export line.
- Files for this card's commit: src/adapters/bambu/readObjects.ts (new), src/adapters/bambu/readBambu.ts,
  src/adapters/model/readModel.ts, src/domain/coreModel.ts, src/domain/project/project.ts, src/readProject.ts (only the
  two `createBambuReader(...)` lines; the `readPrusa2` lines there belong to VWR-25), test/readBambu.test.ts,
  test/readBambuObjects.test.ts (new), test/support/projectJson.ts (new), test/fixtures/real/auto_pa_line_single.3mf and
  .golden.json (new), test/fixtures/real/PROVENANCE.md (last line).

### sp11-rev-vwr-22 (2026-10-26)

**Review failed (sp11-rev-vwr-22)**

Ran (macOS, Node 24), in `vsslicer/modules/3mf`: `pnpm install` ok; `pnpm build` ok; `pnpm test` 18 files / 290 tests
pass; `node scripts/run.mjs checks` exit 0. `pnpm lint` fails, but only on Prettier in `test/large/generate.ts`
(VWR-32's file, in doing); eslint, `tsc --noEmit` and Prettier over this card's files are clean.

Checked: upstream lines in `.reference/repos/OrcaSlicer@09aa0114:src/libslic3r/Format/bbs_3mf.cpp` (:4486-4533 object/part
parsing with the duplicate-id error, `lastid > 0` ranged volumes, `subtype`; :4464-4472 transform guard; :2336-2357 lone-part
offset: ours compares offsets exactly where upstream uses `isApprox`, harmless). Layering: adapters and domain only, no
VS Code, no cross-module imports. AGPL notice and `Ported from` present. Golden checked by me against the unzipped
fixture: objects 3-6 named 立方体 with `extruder` 1-4, each a `normal_part` 立方体 and a `modifier_part` 通用-立方体 with the
part metadata as written, component transforms from `3dmodel.model`, 4 instances at the item transforms. All agree.

Mutation probes (25, in a `mktemp -d` copy, each restored): killed: singular guard, ranged rule, plate skip, keyless
skip, duplicate id, part close, empty mesh, lone part, `_n` rename, `Object_<n>`, object `name` out of config, component
budget, missing-target notice, subtype, paint to part, attribute cap, end padding, mid padding, core-attribute exclusion.
Survived: (a) component transform order swapped (`readObjects.ts:164`); (b) `findLast` changed to `find`
(`readObjects.ts:100`); (c) id-clash renumbering removed (`readObjects.ts:188`); (d) "same position first" removed;
(e) `xmlns` exclusion and (f) the `obj.mesh` guard on `triangleAttributes` removed in `readModel.ts`. (d) is equivalent
unless part ids repeat, as the card says.

Hostile probes: 5000-deep config, 11-digit id, non-integer part id/lastid, metadata or part outside an object, DTD entity:
all `MalformedXmlError`; build item to a missing part fails; component path `/../../etc/passwd` is only a map lookup
(notice, skipped); self-cycle and a 2^20 fan-out stop at the 100000 budget; one paint attribute on the last of 200000
triangles pads to 200000 entries (16 names max, so bounded at about 3x the XML).

Problems:
1. Criterion 1 is not met: the golden has not been "hand-checked against the GUI" (left unticked by the worker; no GUI
   here). The code and golden agree with the file, so the only missing step is the GUI comparison. Expected fix: the
   coordinator settles it, either by an owner check in Bambu Studio 2.x, or by a proposed decision accepting a
   file-level hand-check for fixtures that the slicer itself wrote (as VWR-25 was accepted); a reviewer must not tick it
   on a different rule.
2. Nested components are untested: swapping `composeTransforms(c.transform, at)` at `readObjects.ts:164` passes every
   test, because every fixture has one component level under an identity parent. Rule: a behaviour the doc comment claims
   ("the composed component transform") needs a test that fails when it breaks. Fix: one test with two non-identity
   component levels, checking the leaf part transform.
3. Smaller untested claims, add while it is back in doing: last `name` wins (`readObjects.ts:100`, doc says "Last
   value"), and the id-clash renumbering (`readObjects.ts:188`).

**Coordinator (sp11-coordinator):** criterion 1 settled after review 1, problem 1 (rule 28): the golden is checked against the fixture's XML, which the reviewer confirmed; the Bambu Studio GUI comparison is its own card (Q28). Problems 2 and 3 (untested nested-component order, last-name-wins and duplicate-id renumbering) still need tests.

### sp11-vwr-22-fix (2026-10-26)

Review problems 2 and 3 fixed with three tests in `test/readBambuObjects.test.ts`: nested components (two non-identity
levels, translate inside, scale outside, checks the leaf part transform), last `name` wins (object and part), and the
id-clash renumbering (same object id in the root and another model part gives ids 1 and 2). No source change.
Mutation probes (restored): swapped `composeTransforms(c.transform, at)` order: killed; `findLast` to `find`: killed;
`while (usedIds.has(id)) id++` removed: killed. Not added: the reviewer's survivors (e) `xmlns` exclusion and (f) the
`obj.mesh` guard in `readModel.ts` (not named as problems). Verification (macOS; CI gate ubuntu-latest): build ok,
prettier clean on the two files, `pnpm test` 19 files / 296 tests pass (one run showed 2 transient failures while other
cards edited the module; two reruns clean), `node scripts/run.mjs checks` exit 0. Release lines unchanged.

**Re-review passed (sp11-coordinator, rule 28: checked against review 1's problems 2 and 3; problem 1 settled in criterion 1)** (2026-10-26)
- `test/readBambuObjects.test.ts` 21/21 in `vsslicer/modules/3mf`; prettier clean on `src` and the test file.
- Probes, each in place and restored (`cmp` identical): `composeTransforms(at, c.transform)` at `readObjects.ts:164` fails 1 test; `findLast` to `find` at :100 fails 1; the `usedIds` renumbering at :188 removed fails 1.
- Criterion 1 ticked on its settled wording (hand-checked against the fixture's XML, confirmed by sp11-rev-vwr-22); the GUI check is VWR-399 (Q28).
