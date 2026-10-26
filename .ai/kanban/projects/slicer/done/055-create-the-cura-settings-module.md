---
id: 55
title: Create the `cura-settings` module
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8]
created: 2026-10-25
---

Cura settings resolution: the formula evaluator for the Python-expression subset in Cura's definitions and the container stack resolver. Own module because the CuraEngine adapter and PRF's settings form both consume it and PRF must not build a second evaluator.

**Code:** `vsslicer/modules/cura-settings/` (module: `cura-settings`, layer: n/a (module scaffold))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside the module
- [x] `domain/ application/ adapters/ presentation/` folders exist as needed and the layer-boundary lint is on
- [x] `node scripts/run.mjs ci` picks the module up; `package.json` has `@vsslicer/cura-settings`, version `0.0.0` and `AGPL-3.0-or-later`

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

