---
id: 34
title: Create the `mesh` module
type: chore
priority: P0
effort: S
model: sonnet
area: [mesh]
story: US11
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Creates the `mesh` module from the `tooling` module.

**Code:** `vsslicer/modules/mesh/` (module: `mesh`, layer: n/a (scaffold))

## Acceptance criteria

- [x] `cd vsslicer/modules/mesh && pnpm install && pnpm test && pnpm build` works alone inside the module
- [x] Folders `domain/`, `application/`, `adapters/` exist as needed and the layer-boundary lint rule runs
- [x] `node scripts/run.mjs ci` picks the module up
- [x] Package name `@vsslicer/mesh`, version 0.0.0, changelog and SPDX headers present

## Tasks

- [x] Create from the tooling module
- [x] Add the layer folders and a smoke test
- [x] Check `run.mjs ci`

## Progress

Done. `vsslicer/modules/mesh/` copied from gcode-api (prepack, tsconfig, eslint, vitest, npmrc, workspace settings, LICENSE), package `@vsslicer/mesh` 0.0.0, CHANGELOG, README, lockfile (created by `pnpm install`, no dependency beyond gcode-api's devDependency set), `src/{domain,application,adapters}` (the last two hold `.gitkeep`), smoke test. Verified: `pnpm install && pnpm lint && pnpm build && pnpm test` pass; a temporary domain-imports-application file failed the boundary lint (then removed). `run.mjs ci` pickup verified by reading its discovery (every `modules/*/package.json`); not run (it would publish).

Changelog: VWR-34: module scaffold.

Review passed (vwr3438-reviewer): standalone pnpm install/lint/build/test green (8 tests); prepack=pnpm build present, pnpm pack ok; run.mjs test --list includes @vsslicer/mesh; deliberate domain->application import fails boundaries/dependencies (probe removed); layer folders, SPDX, name/version, CHANGELOG ok.
