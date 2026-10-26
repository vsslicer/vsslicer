---
id: 202
title: Keep both entities when a Prusa printer model and printer preset share a name
type: bug
priority: P0
effort: S
model: opus
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 1 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Not started.

2026-10-26, sp11-prf-202-206 (profiles-prusa, adapters/import). Notes: `.reference/notes/PRF-202-kind-qualified-ids.md`.

- **Fix** (`src/adapters/import/import.ts`, pass before the split): an entity whose bare id another kind already
  holds, earlier in the file or in an earlier file of the call, gets the id `<kind>:<name>` (`printer:SV06`);
  `native.name` keeps the section name. Same-kind repeats still skip with the "already imported" warning. It runs
  before `splitVariants`, so a nozzle's id, its override `when` and its model's `nozzles` agree. Upstream keeps
  one collection per kind (PrusaSlicer-2.9@b028299:src/libslic3r/PresetBundle.hpp:51,53,57;
  src/libslic3r/Preset.hpp:74). Only the behaviour is taken from upstream (AGPL-3.0), no code.
- `src/adapters/import/split.ts`: models are looked up by section name (`native.name`) and grouped by
  `p.family`. Live Jubilee needs this: the vendor id `Jubilee` holds the bare id, so the model becomes
  `printer_model:Jubilee`.
- **Live check** against PrusaSlicer-settings@a40f669: `Sovol/1.0.0.ini` skips 0 (was 8), and `SV06` lists its
  nozzles as `printer:SV06` plus 0.3/0.6/0.8. `Jubilee/1.0.0.ini` skips 0 (was 2), and `printer_model:Jubilee`
  has 8 settings and both nozzles.
- **Tests** (`test/adapters/import.test.ts`, describe "one name in several kinds (PRF-202)"): SV06 model plus
  nozzle; a model named like its vendor; a model plus an unsplit printer; the user presets print/, filament/ and
  printer/ `My MK4`. The hostile test covers a section already named `filament:X`, a same-kind repeat, and
  `__proto__` in two kinds. All are skipped or qualified, none overwritten, and the prototype is untouched.
- **Bounds:** the pass is one linear loop over the entities already capped by MAX_IMPORT_SECTIONS. It adds no
  parse, no regex and no copies of input.
- **Mutation probes**, run on a scratch copy: removing the rename fails 5 tests. Checking only this file's ids
  (no cross-file check) fails 3. Renaming same-kind repeats too fails 1 (hostile). Looking models up by entity id
  again fails 1 (vendor-named model).
- **Verify** (macOS, Node 26.12.1): `pnpm install` ok, `pnpm build` ok, `pnpm test` 11 files / 245 tests pass,
  and `node scripts/run.mjs checks` exits 0. In `pnpm lint`, eslint and `tsc -p tsconfig.test.json` pass and
  prettier passes on my files. Prettier fails only on `src/adapters/export/prusa/types.ts`, another worker's
  untracked file. CI gate platform: ubuntu-latest (module CI job).
- **Not done:** an `inherits` name that points at a parent which got qualified is not rewritten.
- Shares `split.ts` and `import.test.ts` with PRF-206. Hunks for this card: the rename loop in `import.ts`, the
  `models.set(r.native.name` line and the `groups` key in `split.ts`, and the PRF-202 describe block.

**Review passed (sp11-rev-prf-202-206)**

- Ran (Node 26.12.1, macOS): `pnpm install` ok, `pnpm build` ok, `node scripts/run.mjs checks` exit 0. Module-wide `pnpm lint` and `pnpm test` fail only in another worker's untracked export files (`src/adapters/export/prusa/export.ts:51` no-control-regex, `test/adapters/export-prusa.test.ts:33` irregular whitespace, 3 failing `export-prusa` tests, 281/284 pass). Scoped to this card's files: eslint and prettier clean on `src/adapters/import` and `test/adapters/import.test.ts`, `tsc -p tsconfig.test.json` clean, `import.test.ts` 29/29 pass with the PrusaResearch golden running.
- Mutation probes (scratch copy, golden enabled): no rename fails 5; renaming same-kind repeats too fails 1; dropping the cross-file `result.native` check fails 3; models keyed by entity id again fails 1; groups keyed by `model.id` again fails 1.
- Live: Sovol/1.0.0.ini 208 entities, 0 skipped, `SV06.nozzles` = printer:SV06 + 0.3/0.6/0.8; Jubilee/1.0.0.ini 15 entities, 0 skipped, `printer_model:Jubilee` has 8 settings and both nozzles. Matches the card.
- Hostile: the test covers a literal `[print:filament:X]`, same-kind repeats and `__proto__` in two kinds; all skipped with a warning, none overwritten, prototype untouched. A qualified id that collides is skipped by `add`, never overwrites.
- Upstream citations checked at PrusaSlicer-2.9@b028299 (PresetBundle.hpp:51,53,57; Preset.hpp:74). Adapters layer only, no cross-module imports. The audit's fix is applied as written; `inherits` to a qualified parent is a stated gap.

Release lines:
- CHANGELOG: `- PRF-202: a name another kind already holds in one import (a [printer_model] and its [printer], a vendor and its model, user print/filament/printer presets) gets the id \`<kind>:<name>\` instead of being skipped; \`native.name\` keeps the section name.`
- Exports: none.
