---
id: 38
title: Implement the import use cases over registered importers
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [137, 138, 139, 136, 118]
created: 2026-10-25
---

The core use cases that route a source to the registered `Importer`s, collect `ImportResult`s and diagnostics, and never let one failing importer stop the others. Importer ports and result types come from `profile-api`.

**Code:** `vsslicer/modules/profiles/src/application/import/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [x] With fake importers registered, a failing importer yields a diagnostic with a code and the others' entities still arrive; each failure kind (cycle, unknown parent, malformed line, invalid JSON, unknown type, unreadable folder) has a code passed through unchanged
- [x] The use cases run against an in-memory source in plain Node (no VS Code)
- [x] No entity that fails schema validation is returned; it becomes a diagnostic instead
- [x] The same contract suite `runImporterContract` from `profile-api` passes against the registry as a composite importer
- [x] Bounds (added by sp12-prf-38, rule 25): one call imports at most `MAX_IMPORT_FILES` files (the cap is accepted, cap plus one is refused with an error diagnostic and no importer runs); file paths and messages copied from input into diagnostics are clipped to a fixed length; `native` merged from importer results is a null-prototype object, so ids `__proto__` and `constructor` stay plain keys

## Tasks

- [x] Write the importer registry
- [x] Write the use cases
- [x] Tests with fake importers

## Progress

Not started.

sp12-prf-38 (2026-10-26): done, ready for review.

Files (all new): `vsslicer/modules/profiles/src/application/import/{registry,import-profiles,index}.ts`,
`vsslicer/modules/profiles/test/import.test.ts` (11 tests). Built against `@vsslicer/profile-api@0.1.3` (installed).

- `createImporterRegistry(importers): Importer`: the composite. `formats` is the deduplicated union; each file goes to
  the first registered importer whose `canHandle` claims it (a throwing `canHandle` claims nothing); unclaimed files
  get an `unknown-type` warning; importers run concurrently, and one that rejects or returns no result shape becomes an
  error diagnostic while the others' entities, native forms and diagnostics (unchanged) still arrive.
- `importProfiles(source, importer, validate)`: reads a `ProfileSource` (`label`, `read()`; a rejecting read gives
  `unreadable-folder`), runs the importer, and passes every entity through an `EntityValidator` port; a rejected (or
  validator-throwing) entity is dropped with its native form and becomes an error diagnostic.
- Design choices for review: (1) `DiagnosticCode` is closed and has no "importer crashed" or "fails schema" code, so
  an importer that rejects is reported as `unreadable-folder` and a schema failure as `invalid-json`, each marked with
  a `shortcut:` comment; profile-api should add codes for both the next time it changes. (2) The validator is a port,
  not Ajv in the application layer: `profiles` has no Ajv dependency and I may not edit `package.json`. A real Ajv
  adapter over `allSchemas` (as in profiles-prusa's tests) is a follow-up card in `adapters`. (3) Entities carry no
  kind, so the validator decides which schema applies. (4) Two importers returning the same id are not detected.

Probes (rule 19; each change made, `vitest run test/import.test.ts` run, file restored; all 19 made the suite fail):
- AC1: importer rejection rethrown instead of caught: fails. Diagnostics rewritten to code `cycle` instead of passed
  through: fails. Unreadable-source catch rethrows: fails.
- AC2: in-memory `source.read()` replaced by `[]`: fails.
- AC3: schema check bypassed (`if (true)`): fails. Native filtered by all entities instead of kept ones: fails.
  Throwing validator rethrown: fails.
- AC4: unclaimed-file diagnostic removed: the `runImporterContract` test fails with "Importer contract failed"
  (confirmed alone with `-t contract`).
- Bounds: cap `> MAX+1` (cap plus one accepted): fails; cap `>= MAX` (cap refused): fails; clip disabled: fails;
  clip at 1023 instead of 1024: fails; use-case label unclipped: fails; registry native `{}`: fails; use-case native
  `{}`: fails.
- Other guards: throwing `canHandle` not guarded: fails; `findLast` instead of first claimer: fails; formats not
  deduplicated: fails; result-shape guard reduced to `!r`: fails.

Verification (run locally on macOS, Node 24; CI runs on ubuntu-latest, and one workflow has a ubuntu/macos/windows matrix): in `modules/profiles`,
`pnpm install`, `pnpm lint`, `pnpm build` pass and `pnpm test` gives 6 files, 47 tests passed;
`node scripts/run.mjs checks` exits 0. The 50000-file bound test has an explicit 30 s hang guard.

Release lines:
- `src/application/index.ts`: `export * from './import/index.ts';`
- CHANGELOG (profiles, Added): `Importer registry (`createImporterRegistry`), a composite Importer that routes files to
  the first claiming importer and turns a failing importer into a diagnostic, and the `importProfiles` use case over a
  `ProfileSource` with an `EntityValidator` port; at most 50000 files per import (PRF-38).`

**Review failed (sp12-rev-prf-38)** (2026-10-26)

Ran in `modules/profiles`: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build` pass; `pnpm test` 6 files,
47 tests passed; `node scripts/run.mjs checks` exits 0. Layering is clean (application imports only
`@vsslicer/profile-api`, no VS Code, no relative cross-module imports). Every AC has a probe in Progress; tests use
literal expected values. Mutation probes (in a `mktemp -d` copy): cap `> MAX+1` and `>= MAX` killed; registry and
use-case native `{}` killed; schema bypass killed; rejection rethrown killed; throwing `canHandle` unguarded killed;
`findLast` killed; diagnostics recoded to `cycle` killed; unknown-type severity changed killed. Survived: clip
`s.length > MAX_DIAGNOSTIC_TEXT + 1` (problem 2). Hostile probes: an importer that throws `Object.create(null)`, a
validator that throws it, a `native: null` result (handled), a frozen result from a direct importer.

1. `src/application/import/registry.ts:64` (and `import-profiles.ts:34`, `:46`): `String(error)` inside the catch
   throws `TypeError: Cannot convert object to primitive value` when the thrown value has no usable `toString` (probe:
   registry of a good `.json` importer plus one whose `import` throws `Object.create(null)`, over `a.json` and
   `b.cfg`, rejects whole and the good importer's entity is lost). That breaks AC1, where one failing importer must
   never stop the others; a validator that throws it rejects `importProfiles` the same way. Fix: turn every caught
   value into text through a single helper that cannot throw (try `String(e)`, fall back to a fixed
   `'unprintable error'`), use it in all three catches, and add a test that throws `Object.create(null)` from an
   importer and from the validator.
2. `test/import.test.ts:191`: the clip bound is tested at 1024 (kept) and 5000 (clipped), but not at cap plus one, so
   the `> MAX_DIAGNOSTIC_TEXT + 1` mutant survives. The SP12 rule says a bound's test asserts the exact cap: add a
   1025-character path and expect `${'p'.repeat(1_024)}…`.
3. (minor) `src/application/import/import-profiles.ts:52`: `result.diagnostics.push` writes into the array the
   importer returned, so a result with a frozen `diagnostics` array (probe: a direct importer returning
   `Object.freeze`d arrays and one invalid entity) makes `importProfiles` reject. Fix: build a new array
   (`const diagnostics = [...result.diagnostics]`) rather than changing the importer's output.

sp12-prf-38b (2026-10-26): rework per sp12-rev-prf-38, ready for review.

1. `registry.ts`: new `errorText(error)` that never throws (`String(error)`, falling back to `'unprintable error'`),
   used in the registry catch and in all three places `import-profiles.ts` turned input into text (source read
   failure, validator throw, entity id). New test: one importer throws `Object.create(null)` and the validator throws
   it as well. Both become diagnostics with `unprintable error`, and `importProfiles` resolves.
2. Clip test now also checks a 1025-character path, which gives `${'p'.repeat(1_024)}…`.
3. `import-profiles.ts`: diagnostics go into a new array (`[...result.diagnostics]`), so the importer's result is
   never written into. New test: a direct importer returns frozen arrays plus one invalid entity.

Probes (each mutation made, `vitest run test/import.test.ts` run, file restored and checked with `cmp`; all killed):
clip `> MAX_DIAGNOSTIC_TEXT + 1`; registry catch back to `String(error)`; validator catch back to `String(error)`;
`errorText` fallback rethrows; `diagnostics` aliased to `result.diagnostics` (frozen array written into).
All earlier probes and ACs are unchanged.

Verification (macOS, Node 24; CI runs on ubuntu-latest): in `modules/profiles`, `pnpm install`, `pnpm lint` and
`pnpm build` pass, and `pnpm test` gives 6 files, 49 tests passed. `node scripts/run.mjs checks` exits 0.
The release lines above are unchanged.

**Review passed (sp12-rev2-prf-38)** (2026-10-26)

Ran in `modules/profiles`: `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm build` pass; `pnpm test` 6 files,
49 tests passed; `node scripts/run.mjs checks` exits 0. Layering unchanged and clean (application imports only
`@vsslicer/profile-api`). All three problems from sp12-rev-prf-38 are fixed:
1. `errorText` (`registry.ts:14`) is used in the registry catch and in all three `import-profiles.ts` spots.
   Hostile probes against the real code: a source read that throws `Object.create(null)` gives
   `cannot read the source: unprintable error`; an entity whose id is `Object.create(null)` gives
   `unprintable error fails the profile schema: bad`; a thrown `{ toString() { return {} } }` and a thrown `Symbol`
   both become importer diagnostics. None rejects.
2. The clip test asserts 1024 kept and 1025 clipped to `${'p'.repeat(1_024)}…`.
3. `import-profiles.ts:41` copies the diagnostics; the frozen-result test covers it.

Mutation probes (in a `mktemp -d` copy, each killed): clip `> MAX_DIAGNOSTIC_TEXT + 1`; registry catch back to
`String(error)`; validator catch back to `String(error)`; `errorText` fallback throws; `diagnostics` aliased to
`result.diagnostics`. Earlier probes rerun, all killed: cap `> MAX+1`, cap `>= MAX`, registry native `{}`, use-case
native `{}`, schema check bypassed.

Non-blocking: `importProfiles` trusts the importer it is given. A direct importer that rejects, or returns
`native: null`, still rejects the use case. The registry guards against both, and it is the importer the use case is
meant to run.
