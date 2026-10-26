---
id: 15
title: Create the `slicer-orca` module
type: chore
priority: P0
effort: S
model: sonnet
area: [orca]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Adapter module for OrcaSlicer: detection, download, the CLI driver, preset emission from resolved profiles and the Orca capability table. Depends on `slicer-api`, `slicer-runtime` and `profile-api`.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (module scaffold))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [x] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [x] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/slicer-orca`, version `0.0.0` and `AGPL-3.0-or-later`

## Tasks

- [ ] Create the module from the `tooling` module layout
- [ ] Add package.json, tsconfig, vitest and the CI hook
- [ ] Add a smoke test

## Progress

Not started.

Review (sp8-reviewer-6, 2026-10-26): PASS

1. Standalone copy minus node_modules/dist: pnpm install, test (3 pass), lint, build all exit 0.
2. layers.test.ts proves domain->application import fails with boundaries/dependencies, application->domain passes.
3. LICENSE, .npmrc, tsconfig*, vitest/eslint config, pnpm-workspace identical to profiles; name, description and README correct; version 0.0.0.
4. `node scripts/run.mjs install --list` lists the module. `node scripts/run.mjs checks` exits 0.
5. Fixed in place (comment only, rule 19): stale copy-paste comment 'until the profile model lands' in src/domain/index.ts changed to 'until the public API lands'.
