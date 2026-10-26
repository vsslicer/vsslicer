---
id: 113
title: Export .curaprofile
type: feature
priority: P1
effort: M
model: sonnet
area: [export]
story: US46
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [112, 54, 135]
created: 2026-10-25
---

Writes `.curaprofile` files that Cura can load.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/bundles/cura/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [x] `import(export(x))` equals x; an unmodified fixture re-exports byte-equivalently where the format allows
- [x] No credentials in the output

## Tasks

- [x] Write the writer
- [x] Round-trip tests

## Progress

Not started.

**Coordinator note (sp12-coordinator):** PRF-112's worker found `writeCuraProfileArchive` builds its zip entries in a
plain `{}`, so an id `__proto__` is written under the wrong entry name (`0`). Fix it here (a `Map` or
`Object.create(null)`) with a test on `__proto__` and `constructor` ids. Byte-identical re-export needs the zip
external attributes `0o600 << 16` (PRF-111 spike, `docs/spikes/curaprofile.md`).

**sp12-prf-113 (done):** `writeCuraProfile(input)` in `src/adapters/bundles/cura/write.ts` (quality_changes entities through
`writeCuraUserChanges`, global entry first, then `writeCuraProfileArchive`). Archive writer: fflate's `zipSync` collects
entries in a plain `{}` internally (`fltn`/`zipSync`, so `__proto__` is lost even with a null-prototype input), so
`storedZip` now writes the STORED zip by hand: FAT/2.0, 1980 date, `0o600 << 16` attributes. An unmodified fixture
re-exports byte for byte. Credentials: settings whose key matches api key / password / secret / token / credential /
access code / auth are dropped with a warning (a quality_changes entity holds no such key normally; this is a guard).
Machine settings (`definition_changes`) are skipped with a warning.
Probes (criterion by criterion): import(export(x)) equals x and byte-identical re-export: dropped the attrs line, the
byte and attrs tests failed. No credentials: disabled `SECRET_KEY` test, credentials test failed. `__proto__`/
`constructor` ids: renamed `__proto__` entry, both tests failed. Global first: removed sort, test failed. Machine
skip: removed warning, test failed. Archive over limit gives error diagnostic: covered by the maxEntries 0 test.
Verification: profiles-cura lint, build, test (13 files, 217 tests) pass; `node scripts/run.mjs checks` pass (84, 0 fail).
CI gate platform: Linux (ubuntu); tests are platform-independent.

Release lines:
- CHANGELOG: Add `writeCuraProfile` (export a `.curaprofile`); the archive writer keeps entries named `__proto__` and writes Cura's `0o600` zip attributes.
- index.ts: `export { writeCuraProfile } from './adapters/bundles/cura/write.ts';` and `export type { CuraProfileExport } from './adapters/bundles/cura/write.ts';`

**Review failed (sp12-rev-prf-113)**

Ran: profiles-cura `pnpm install`, `pnpm lint` (eslint, prettier, tsc), `pnpm build`, `pnpm test` (13 files, 217 tests,
all pass); `node scripts/run.mjs checks` (84 pass, 0 fail). Layering: everything in `adapters`, no VS Code, no
cross-module relative imports. Upstream: `Cura/plugins/CuraProfileWriter/CuraProfileWriter.py:24-31` (bare
`ZipInfo(profile.getId())`, so STORED, 1980, `0o600 << 16`) matches the spike and `storedZip`.

Mutation probes (in a `mktemp -d` copy): drop the `0o600` attrs line: byte-for-byte and attrs tests fail. Secret filter
off: credentials test fails. Write `__proto__` under `0`: both id tests fail. Drop the global-first sort: fails. Drop the
UTF-8 name flag: fails. Drop the machine-settings warning: fails. Rethrow archive errors: fails. Hostile: a non-ASCII id
round-trips; `__proto__`/`constructor` ids keep their entry names.

Problems:

1. Credentials reach the output through `native` (criterion "No credentials in the output").
   `src/adapters/bundles/cura/write.ts:45-53` filters only `e.settings`; `native[id]` goes to `writeCuraUserChanges`
   whole. Probe: a `.curaprofile` with `octoprint_api_key = SECRETM` under `[metadata]` reads into
   `native.a.octoprint_api_key` and `writeCuraProfile` writes `octoprint_api_key = SECRETM` back, with no diagnostic.
   Fix (rule): the credential guard applies to every key the writer emits, settings and native metadata/general
   alike, with a test that puts a credential key in `[metadata]` and asserts it is absent and warned.
2. Two bounds have no test. Removing the `CURA_EXPORT_LIMITS.maxEntities` cap (`write.ts:31-33`, `:38`) or the
   1000-diagnostic cap (`write.ts:29`, `:54`) leaves all 35 writer and archive tests green. Fix (rule): every bound
   has a test that asserts the exact cap (at the cap and one over), or the bound goes. The entity cap is shadowed
   by the archive's default `maxEntries` (1000) for the output, so deleting it is fine if the loop's work is
   bounded another way; the diagnostics cap needs a test asserting exactly 1000.

**sp12-prf-113b (review fixes):** (1) `src/adapters/bundles/cura/write.ts`: the `SECRET_KEY` guard now also filters every `native` key (metadata/general) before it reaches `writeCuraUserChanges`, with a warning. Test: `octoprint_api_key = SECRETM` in `[metadata]` is absent and warned. Probe: guard removed, test fails. (2) Bounds tested: entity cap exactly 10000 (9999 junk + 1 valid is written; 10000 junk + 1 valid is refused with the "more than 10000" error); diagnostics cap exactly 1000 (999/1000/1001 junk give 999/1000/1000; 1500 inner warnings give 1000, also after one earlier outer diagnostic). Probes: dropping the entity `slice` fails, dropping the `< 1000` guard fails, widening the entity check by one fails, replacing `1000 - diagnostics.length` fails. Verification: profiles-cura lint, build, test (13 files, 220 tests) pass; `node scripts/run.mjs checks` pass. Release lines: unchanged.

**Coordinator re-review (sp12-coordinator, rule 29, against the FAIL criteria):** `pnpm lint` and `pnpm test` 220/220 pass; probe "native credential filter removed" fails the metadata-credential test, restored; the worker probed both caps at the exact value. Pass.
