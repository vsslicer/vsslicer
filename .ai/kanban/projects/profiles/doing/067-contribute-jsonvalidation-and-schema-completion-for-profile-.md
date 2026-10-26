---
id: 67
title: Contribute jsonValidation and schema completion for profile files
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US28
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [57, 135, PLT-202]
created: 2026-10-25
---

Maps E11's JSON Schema onto `.vsslicer/profiles/**/*.json` so VS Code's JSON service gives completion and hover.

**Code:** `vsslicer/modules/profiles-extension/package.json` contributes and the bundled schema (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [x] In an integration test completion inside `settings` offers catalogue keys, and a wrong type shows a schema error
- [x] The shipped schema files are the published E11 files (hash test)

## Tasks

- [x] Add contributes.jsonValidation
- [x] Bundle the schema
- [x] Integration test

## Progress

- `package.json`: 8 `contributes.jsonValidation` entries, `.vsslicer/profiles/<entity>/**/*.json` (entity folders `vendor`, `printer-model`, `nozzle`, `surface`, `feeder`, `material`, `process`, `printer-instance`; the folder layout is my choice, not defined elsewhere) mapped to `schemas/<entity>.json`; `schemas` added to `files`.
- `@vsslicer/profile-api` ^0.1.2 as devDependency. The schemas are JS objects (`allSchemas`), not files, so `pnpm sync-schemas` (`scripts/sync-schemas.ts`) writes them to `schemas/`. Deviation: the published files `$ref` each other by `https://vsslicer.dev/schema/profile/...`; VS Code refuses that ("untrusted", and ENOTFOUND on 1.100), so the only change is that prefix becoming `./` (`scripts/schema-files.ts`). Tried and rejected: a never-matching `defs` jsonValidation entry, and `json.schemas` inline via configurationDefaults.
- `test/schemas.test.ts`: sha256 of each shipped file equals the transform of the package's schema, and un-localising it deep-equals the published schema; every entity schema is contributed once and `schemas` ships.
- Integration (`test/integration/extension.test.ts`): completion inside `settings` offers `nozzle_diameter`; `"layer_height": "thin"` produces a schema diagnostic. Limit: the published settings schema names only the 144 per-extruder catalogue keys, so completion offers those, not all ~800 catalogue keys; completing all needs the schema to list them (profile-api follow-up).
- Mutation probes: changing `exclusiveMinimum` in `schemas/process.json` fails the hash test; renaming the process fileMatch fails both integration tests. Both restored.
- Verified: `pnpm lint` clean, build ok, `pnpm test` 7 pass, `pnpm test:integration` 3 pass on 1.100.0 and stable, `node scripts/run.mjs checks` exit 0.

**Review failed (sp10-coordinator; review dispatch was refused by the permission classifier, so the coordinator, who wrote none of this code, reviewed)**: lint, build and `pnpm test` 7 pass, and the schema tests are sound (hash and content equal to profile-api's `allSchemas` after the one `./` prefix change; every entity contributed once). But the schemas do not ship: `pnpm package` fails the VSIX content check with `content: missing extension/schemas/process.json` and `.../printer-instance.json`, because `.vscodeignore` is an allowlist (`**` then `!dist/*.js`, ...) with no `!schemas/*.json`. The jsonValidation URLs would point at files missing from the VSIX.
1. Add `!schemas/*.json` to `.vscodeignore`; `pnpm package` into a scratch dir must pass and list all nine schema files (then delete the VSIX). Add a test that every `jsonValidation` url is matched by a `.vscodeignore` allow rule, failing with the line removed.

**Review fix (sp10-prf-67-fix)**: added `!schemas/*.json` to `.vscodeignore`; added a test in `test/schemas.test.ts` that every `jsonValidation` url matches a `.vscodeignore` allow rule. Mutation probe: with the `!schemas/*.json` line removed the test fails (`schemas/vendor.json is not allowed in .vscodeignore`); restored. `pnpm test` 8 pass, lint and build clean.
**BLOCKED, `pnpm package` still fails**: the VSIX now holds all nine schema files, but the tooling content check (`@vsslicer/tooling` `bin/vsslicer-package.mjs`, `checkContent`/`assets`) only accepts files named by a string under `contributes` or `icon`, so `schemas/defs.json` (the `$ref` target of every entity schema, not contributed) is reported `content: unexpected extension/schemas/defs.json`. defs.json must ship or the `./defs.json` refs break. Needs a `tooling` change (allow a declared extra-asset list, or accept `files`-listed dirs), outside this module; not done here.
