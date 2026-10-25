---
id: 8
title: Set up vitest for libraries
type: feature
priority: P0
effort: S
model: sonnet
area: [ci]
story: US2
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [3]
created: 2026-10-25
---

Module: `tooling`. A shared vitest config in `@vsslicer/tooling` that every library module uses. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [ ] `modules/example` has a passing vitest suite run by its own `pnpm test` and by `scripts/run.mjs test`
- [ ] Coverage reporter configured; the shared vitest config is exported from `@vsslicer/tooling`
- [ ] A failing test makes `pnpm test` exit non-zero

## Tasks

- [ ] Add shared vitest config
- [ ] Add the sample test
- [ ] Wire `test` and `test:coverage`

## Progress

Not started.
