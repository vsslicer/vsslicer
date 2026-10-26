---
id: 65
title: Create the `slicer-cura` module
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US16
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Adapter module for CuraEngine: engine acquisition from the pinned Cura release, the headless CLI driver, STL export of plates and the Cura capability table. Depends on `slicer-api`, `slicer-runtime`, `cura-settings`, `mesh` and `profile-api`.

**Code:** `vsslicer/modules/slicer-cura/` (module: `slicer-cura`, layer: n/a (module scaffold))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [x] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [x] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-cura`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [x] Create the module from the `tooling` module layout
- [x] Add package.json, tsconfig, vitest and the CI hook
- [x] Add a smoke test

## Progress

Not started.

Review (sp8-reviewer-6, 2026-10-26): PASS

1. Standalone copy minus node_modules/dist: pnpm install, test (3 pass), lint, build all exit 0.
2. layers.test.ts proves domain->application import fails with boundaries/dependencies, application->domain passes.
3. LICENSE, .npmrc, tsconfig*, vitest/eslint config, pnpm-workspace identical to profiles; name, description and README correct; version 0.0.0.
4. `node scripts/run.mjs install --list` lists the module. `node scripts/run.mjs checks` exits 0.

