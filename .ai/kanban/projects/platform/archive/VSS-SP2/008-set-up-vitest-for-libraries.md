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
owner: PLT-8-worker
depends_on: [3]
created: 2026-10-25
---

Module: `tooling`. A shared vitest config in `@vsslicer/tooling` that every library module uses. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] `modules/example` has a passing vitest suite run by its own `pnpm test` and by `scripts/run.mjs test`
- [x] Coverage reporter configured; the shared vitest config is exported from `@vsslicer/tooling`
- [x] A failing test makes `pnpm test` exit non-zero

## Tasks

- [x] Add shared vitest config
- [x] Add the sample test
- [x] Wire `test` and `test:coverage`

## Progress

Done (code in `vsslicer/`).
- `@vsslicer/tooling` 0.3.0: `vitest.config.mjs` exported as `@vsslicer/tooling/vitest` (plain object, v8 coverage, text+lcov to `coverage/`); test asserts it. Plain object so tooling needs no vitest dependency; each consumer pins `vitest` and `@vitest/coverage-v8` 5.0.5 (pnpm does not expose transitive bins).
- `example` 0.3.0: vitest suite, `vitest.config.ts` (mergeConfig on shared base), scripts `test` / `test:coverage`; coverage output shown (100%).
- `example-extension` 0.2.1 stays on node:test; dependencies raised.
- Verified: failing test (temporarily wrong expectation) gave `pnpm test` exit 1, reverted gives 0; `--frozen-lockfile` with empty store OK for all three; `node scripts/run.mjs ci` green (tooling 0.3.0, example 0.3.0, example-extension 0.2.1 published); runner tests 6/6. Registry left running.
- CONTRIBUTING.md test paragraph updated; `coverage` added to `vsslicer/.gitignore`.
- Files: vsslicer/modules/tooling/{vitest.config.mjs,package.json,CHANGELOG.md,pnpm-lock.yaml,test/vitest-config.test.mjs}; vsslicer/modules/example/{package.json,pnpm-lock.yaml,CHANGELOG.md,vitest.config.ts,test/greeting.test.ts}; vsslicer/modules/example-extension/{package.json,pnpm-lock.yaml,CHANGELOG.md}; vsslicer/.gitignore; CONTRIBUTING.md; .reference/notes/PLT-8-vitest.md.
