---
id: 49
title: Create the `agent-protocol` module
type: chore
priority: P0
effort: S
model: sonnet
area: [agent-protocol]
story: US40
milestone: "VSS:M3"
sprint: "VSS:SP8"
depends_on: [2, 3, 4, 8]
created: 2026-10-25
---

Creates the independent `@vsslicer/agent-protocol` module from the `tooling` module so every later card has a home. Verified on fixtures only (D5).

**Code:** `vsslicer/modules/agent-protocol/` (module: `agent-protocol`, layer: n/a (scaffold))

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside the module with a placeholder test
- [x] `src/` has `domain/ application/ adapters/ presentation/` and the layer-boundary lint rule is active (a deliberate violation fails lint)
- [x] `node scripts/run.mjs ci` picks the module up; its `.npmrc` points `@vsslicer` at the local registry; depends on `vscode-jsonrpc` and `@sinclair/typebox` (MIT) with licence check passing

## Tasks

- [x] Scaffold package.json, tsconfig, eslint, vitest from `tooling`
- [x] Add the CI job entry and `.npmrc`
- [x] Add `CHANGELOG.md` and version 0.0.0

## Progress

Not started.

Review (sp8-reviewer-6, 2026-10-26): PASS

1. Standalone copy minus node_modules/dist: pnpm install, test (3 pass), lint, build all exit 0.
2. layers.test.ts proves domain->application import fails with boundaries/dependencies, application->domain passes.
3. LICENSE, .npmrc, tsconfig*, vitest/eslint config, pnpm-workspace identical to profiles; name, description and README correct; version 0.0.0.
4. `node scripts/run.mjs install --list` lists the module. `node scripts/run.mjs checks` exits 0.
5. vscode-jsonrpc 10.0.0 and @sinclair/typebox 0.34.52 pinned exactly in package.json; both license MIT per node_modules package.json. Neither is imported yet (scaffold), which the criterion allows (declares the deps only).
