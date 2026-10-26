---
id: 1
title: Create the `profile-api` module
type: chore
priority: P0
effort: S
model: sonnet
area: [schema]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-13]
created: 2026-10-25
---

Creates the independent `profile-api` module (entities, schema, catalogue, pure condition and merge code, ports) from the `tooling` module; adapters and the core depend on it, it depends on nothing.

**Code:** `vsslicer/modules/profile-api/` (module: `profile-api`, layer: n/a (scaffold))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profile-api` with nothing else built
- [x] `domain/ application/` folders exist; a deliberately broken import from `domain` to `application` fails the PLT-4 layer-boundary lint
- [x] `node scripts/run.mjs ci` picks the module up
- [x] `package.json` has name `@vsslicer/profile-api`, version `0.0.0`, licence AGPL-3.0-or-later and no dependency on another VSSlicer module
- [x] A `test/fixtures/` folder with a `PROVENANCE.md` template accepted by the PLT fixtures check exists

## Tasks

- [x] Generate the module from the tooling template
- [x] Add the layer folders and placeholder tests
- [x] Add the boundary-violation fixture test

## Progress

Done. Module `vsslicer/modules/profile-api` created from the gcode-api layout (package.json 0.0.0, AGPL-3.0-or-later, no VSSlicer dependency, prepack builds, own lockfile, CHANGELOG, README, LICENSE, configs). `src/domain/`, `src/application/` placeholders; `test/layers.test.ts` lints a `domain -> application` import with ESLint `lintText` and expects `boundaries/dependencies` (and an `application -> domain` import passes); `test/fixtures/template/PROVENANCE.md` is the template.

Verified: `pnpm install && pnpm lint && pnpm build && pnpm test` pass (2 tests); `node scripts/run.mjs test --changed HEAD` runs `@vsslicer/profile-api`. `scripts/check-fixtures.mjs` reports only an unrelated `gcode-language/test/fixtures/corpus` missing PROVENANCE.md (not this card); profile-api passes it. Not done: full `run.mjs ci` (needs version bump/publish; coordinator releases). Lockfile: created by `pnpm install` (devDependencies only, as gcode-api).

Changelog: PRF-1: module skeleton (already in `## Unreleased`).

Review passed (prf12-reviewer): install, lint, build, test pass standalone (6 tests); prepack present; run.mjs test --list picks up @vsslicer/profile-api; layer test runs real ESLint and expects boundaries/dependencies for domain->application, passes application->domain; check-fixtures exits 0; no VSSlicer dependency.
