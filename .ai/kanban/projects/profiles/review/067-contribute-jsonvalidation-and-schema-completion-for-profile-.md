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
depends_on: [57, 135]
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
