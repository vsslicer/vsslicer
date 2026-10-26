---
id: 3
title: Publish the JSON Schema (draft 2020-12) for every entity with positive and negative fixtures
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [2]
created: 2026-10-25
---

The machine-readable schema that VS Code's JSON service and the importers validate against.

**Code:** `vsslicer/modules/profile-api/src/domain/schema/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [x] One schema file per entity plus a shared `$defs` file; generated from or checked against the TypeScript types so they cannot drift (a test fails when they disagree)
- [x] Every hand-written positive fixture validates; every negative fixture fails with the expected JSON path (missing `id`, bad `host_type` shape, unknown `abstract` type, positional array where a keyed map is required)
- [x] `secret_ref` is accepted but a `password`, `apikey` or `access_code` property in `connection` fails validation
- [x] Verified on fixtures only (D5)

## Tasks

- [x] Write the schemas
- [x] Add the types-versus-schema consistency test
- [x] Write 8 positive and 12 negative fixtures

## Progress

Done. Schemas (draft 2020-12) in `src/domain/schema/`: `defs.ts` (shared `$defs`: id, condition, settingValue, settings, override, meta), one file per entity, `index.ts` exporting `entitySchemas` and `allSchemas` (also re-exported from `src/index.ts`). Schemas are hand-written TS objects (no JSON files); all entity objects are closed (`additionalProperties: false`), so `password`/`apikey`/`access_code` in `connection` fail at `/connection/<name>`.
Verified: `test/schema.test.ts` with ajv: types-versus-schema test (property and required keys per entity, compiled against `Record<keyof T, true>` so a type change fails `tsc`), 8 positive and 20 negative fixtures each asserting the JSON path (missing `id`, bad `host_type` shape, non-boolean `abstract`, positional array for `gcode_templates`/`external_ids`, secrets). `pnpm lint && pnpm test` pass (42 tests). Fixtures only (D5).
Not done: no JSON-file publication for VS Code `json.schemas` yet (schemas are TS objects; a build step could emit them); "unknown abstract type" is implemented as `abstract` must be boolean.
Dependency added: devDependency `ajv@8` (lockfile touched).
Files: src/domain/schema/*.ts, src/index.ts, test/schema.test.ts, package.json, pnpm-lock.yaml.
Changelog: PRF-3: JSON Schema draft 2020-12 for all eight entities (`entitySchemas`, `allSchemas`).

Review passed (prf36-reviewer): lint, build, test green (90 tests in module). Schemas are closed (additionalProperties false throughout), password/apikey/access_code rejected at /connection/<name>, fixtures assert JSON paths. The criteria require no JSON files for json.schemas (only "one schema file per entity", met as TS objects); emitting JSON is follow-up work, not a failure. "Unknown abstract type" is covered as non-boolean abstract (research says abstract is a bool).
