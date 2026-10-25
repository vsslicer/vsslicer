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
sprint: "VSS:SP14"
depends_on: [2, 3, 4, 8]
created: 2026-10-25
---

Creates the independent `@vsslicer/agent-protocol` module from the `tooling` module so every later card has a home. Verified on fixtures only (D5).

**Code:** `vsslicer/modules/agent-protocol/` (module: `agent-protocol`, layer: n/a (scaffold))

## Acceptance criteria

- [ ] `pnpm install && pnpm test && pnpm build` works alone inside the module with a placeholder test
- [ ] `src/` has `domain/ application/ adapters/ presentation/` and the layer-boundary lint rule is active (a deliberate violation fails lint)
- [ ] `node scripts/run.mjs ci` picks the module up; its `.npmrc` points `@vsslicer` at the local registry; depends on `vscode-jsonrpc` and `@sinclair/typebox` (MIT) with licence check passing

## Tasks

- [ ] Scaffold package.json, tsconfig, eslint, vitest from `tooling`
- [ ] Add the CI job entry and `.npmrc`
- [ ] Add `CHANGELOG.md` and version 0.0.0

## Progress

Not started.
