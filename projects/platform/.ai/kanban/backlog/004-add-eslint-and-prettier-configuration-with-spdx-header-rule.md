---
id: 4
title: Add ESLint and Prettier configuration with SPDX header rule
type: feature
priority: P0
effort: S
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [2]
created: 2026-10-25
---

Module: `tooling`. One shared ESLint and Prettier configuration in `@vsslicer/tooling`, consumed by every module, including the SPDX header rule and the layer-boundary rule that enforces the Clean architecture layers. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] `pnpm lint` in a module fails on a deliberately mis-formatted fixture, on an unused import, and on a source file without the SPDX header
- [ ] `import/no-extraneous-dependencies` is an error
- [ ] A layer-boundary rule (`eslint-plugin-boundaries` or `dependency-cruiser`) fails `lint` when `domain` imports `application`, `adapters` or `presentation`, when `application` imports `adapters` or `presentation`, or when any file outside `presentation` imports `vscode`; proven on deliberate-violation fixtures
- [ ] Config is one shared export of `@vsslicer/tooling`, consumed by every module

## Tasks

- [ ] Create `packages/eslint-config` (private)
- [ ] Add Prettier config and `format` script
- [ ] Wire `lint` into every package template

## Progress

Not started.
