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
depends_on: [2]
created: 2026-10-25
---

Shared lint and format rules run by the `lint` task in every package, including a rule that fails on a missing import declaration and on a missing SPDX header placeholder.

## Acceptance criteria

- [ ] `pnpm turbo run lint` fails on a deliberately mis-formatted fixture and on an unused import
- [ ] `import/no-extraneous-dependencies` is an error
- [ ] Config is one shared package consumed by all workspaces

## Tasks

- [ ] Create `packages/eslint-config` (private)
- [ ] Add Prettier config and `format` script
- [ ] Wire `lint` into every package template

## Progress

Not started.
