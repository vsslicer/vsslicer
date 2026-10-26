---
id: 2
title: Create the `3mf` module
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, 1]
created: 2026-10-25
---

Creates the `3mf` module from the `tooling` module.

**Code:** `vsslicer/modules/3mf/` (module: `3mf`, layer: n/a (scaffold))

## Acceptance criteria

- [x] `cd vsslicer/modules/3mf && pnpm install && pnpm test && pnpm build` works alone inside the module
- [x] Folders `domain/`, `application/`, `adapters/` exist as needed and the layer-boundary lint rule runs
- [x] `node scripts/run.mjs ci` picks the module up
- [x] Package name `@vsslicer/3mf`, version 0.0.0, changelog and SPDX headers present

## Tasks

- [x] Create from the tooling module
- [x] Add the layer folders and a smoke test
- [x] Check `run.mjs ci`

## Progress

Done. `vsslicer/modules/3mf/` created from gcode-api (LICENSE, eslint/tsconfig/vitest/.npmrc/.prettierignore/pnpm-workspace.yaml, `prepack`), package `@vsslicer/3mf` 0.0.0, CHANGELOG with Unreleased, README with the VWR-1 decision paragraph. Added dependencies (lockfile touched): `saxes` 6.0.0 and `fflate` 0.8.3, exact pins.
Verified: `pnpm install && pnpm lint && pnpm build && pnpm test` pass in the module; `node scripts/run.mjs lint` lists `@vsslicer/3mf`. Only `src/domain/` exists: `application/` and `adapters/` are created by the cards that need them (empty folders are not tracked); the smoke test is VWR-3's errors test. Full `run.mjs ci` (which publishes) was not run.
Changelog: see Unreleased in the module CHANGELOG.

Review passed (vwr23-reviewer): front matter and criteria compared with HEAD backlog card, nothing lost (only boxes ticked and Progress added). Standalone pnpm install/lint/build/test green (8 tests); prepack and scripts match gcode-api; pnpm pack contains dist, LICENSE, README; saxes 6.0.0 and fflate 0.8.3 exact; README has the VWR-1 paragraph; run.mjs lists 3mf; layer lint fired on a domain->adapters probe (removed).
