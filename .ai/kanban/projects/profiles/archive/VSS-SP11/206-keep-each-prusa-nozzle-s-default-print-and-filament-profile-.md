---
id: 206
title: "Keep each Prusa nozzle's default print and filament profile when splitting"
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP11"
docs: [.ai/audits/SP10-audit.md]
created: 2026-10-26
---

Finding 6 of the SP10 audit (`.ai/audits/SP10-audit.md`): see the report for module, layer, the probe and the fix.

## Acceptance criteria

- [x] The fix the audit names, with a test that fails without it (operation counts, never wall time)
- [x] **Bounds:** any input the fix touches keeps the limits the audit names, with a hostile test

## Progress

Not started.

2026-10-26, sp11-prf-202-206 (profiles-prusa, adapters/import). Notes: `.reference/notes/PRF-206-nozzle-defaults-native.md`.

- **Fix** (`src/adapters/import/split.ts`): when a preset becomes a nozzle, `splitVariants` adds
  `default_print_profile` and `default_filament_profile` (when the preset has them) to a copy of its
  `native.native_only`. A `Nozzle` has no defaults field. The unsplit path still carries them in the entity's
  `defaults`.
- **Tests** (`test/adapters/import.test.ts`): new test "a nozzle keeps its preset's default print and filament
  native (PRF-206)" on `mk4s-nozzles.ini`. The 0.4 nozzle keeps `0.20mm SPEED @MK4S 0.4` and the 0.6 nozzle keeps
  `0.25mm SPEED @MK4S 0.6`, and both keys are listed native-only. The "native form stays attached" test and the
  PrusaResearch golden (200 nozzles) now expect the unsplit native plus these two keys.
- **Bounds:** this adds at most 2 keys per nozzle, and no loop over input beyond the 2-key filter. As a hostile
  case, a preset without the keys adds nothing: the golden filters on `Object.hasOwn(values, k)`.
- **Mutation probe**, run on a scratch copy: leaving `native_only` unchanged fails 2 tests.
- **Verify:** same run as PRF-202 (macOS, Node 26.12.1). `pnpm test` 245/245 pass, `run.mjs checks` exits 0,
  and lint is clean apart from another worker's untracked `src/adapters/export/prusa/types.ts`. CI gate platform:
  ubuntu-latest.
- Shares `split.ts` and `import.test.ts` with PRF-202. Hunks for this card: the `defaults` lines in `split.ts`,
  the new PRF-206 test, and the two updated native-equality assertions.

**Review failed (sp11-rev-prf-202-206)**

- Ran (Node 26.12.1, macOS): `pnpm install` ok, `pnpm build` ok, `node scripts/run.mjs checks` exit 0. Module-wide `pnpm lint` and `pnpm test` fail only in another worker's untracked export files (`src/adapters/export/prusa/export.ts:51` no-control-regex, `test/adapters/export-prusa.test.ts:33` irregular whitespace, 3 failing `export-prusa` tests, 281/284 pass). Scoped to this card's files: eslint and prettier clean on `src/adapters/import` and `test/adapters/import.test.ts`, `tsc -p tsconfig.test.json` clean, `import.test.ts` 29/29 pass with the PrusaResearch golden running.
- Mutation probe: leaving `native_only` unchanged fails 2 tests (good).
- Problems:
  1. The bounds/hostile criterion has no test that can fail. `src/adapters/import/split.ts:64` filters the two keys on `Object.hasOwn(v, k)`; removing that filter (always appending both keys, so `native_only` names keys absent from `values`) leaves `import.test.ts` 29/29 green even with the PrusaResearch golden running, because every preset there and in `mk4s-nozzles.ini` has both keys, and the golden recomputes the expectation with the same filter. The card's "hostile case ... the golden filters on `Object.hasOwn`" is therefore a mirror of the code, not a check. Expected fix: one split test whose preset lacks `default_print_profile` and/or `default_filament_profile` (e.g. a bundle with only one of them), asserting the nozzle's `native_only` gains only the key present; confirm it fails with the filter removed. Rule: an expected value must not be derived with the code's own logic.

Release lines:
- CHANGELOG: `- PRF-206: a printer preset split into a nozzle lists \`default_print_profile\` and \`default_filament_profile\` in \`native_only\`, so its default print and filament are no longer lost.`
- Exports: none.

2026-10-26, sp11-prf-206-fix: review fix. Added test "a nozzle lists only the default keys its preset has (PRF-206)" in `test/adapters/import.test.ts`: a two-variant model whose 0.4 preset has only `default_print_profile` and whose 0.6 preset has only `default_filament_profile`; expected values are literal. Mutation probe: removing the `Object.hasOwn` filter in `split.ts` fails the new test (restored). `import.test.ts` 30/30 pass, eslint clean on the file.

**Review passed (sp11-rev2-prf-206)**

- Ran (Node 26.12.1, macOS) in `vsslicer/modules/profiles-prusa`: `pnpm install` ok, `pnpm lint` clean (eslint, prettier, tsc), `pnpm build` ok, `pnpm test` 12 files, 294/294 pass; `node scripts/run.mjs checks` exit 0.
- Previous problem 1 fixed: the new test "a nozzle lists only the default keys its preset has (PRF-206)" uses literal expectations on presets that each lack one key.
- Mutation probes (in place, file restored from a backup, 30/30 after): (1) removing the `Object.hasOwn(v, k)` filter at `split.ts:64` fails the new test; (2) leaving `native_only` unchanged fails 4 tests incl. both PRF-206 tests and the golden; (3) dropping `default_filament_profile` from the key list fails 4 tests.
- Bounds: at most 2 keys added per nozzle, no new loop over input; a preset without the keys adds nothing (probe 1). Layering: change stays in `adapters/import`, no cross-module relative imports.
