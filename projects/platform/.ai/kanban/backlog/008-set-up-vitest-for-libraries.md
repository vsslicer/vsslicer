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
depends_on: [3]
created: 2026-10-25
---

Unit test runner for every `packages/*` library, run by the `test` task.

## Acceptance criteria

- [ ] `packages/example` has a passing test run through `pnpm turbo run test`
- [ ] Coverage reporter configured; a shared vitest config exports defaults
- [ ] A failing test makes `test` exit non-zero

## Tasks

- [ ] Add shared vitest config
- [ ] Add the sample test
- [ ] Wire `test` and `test:coverage`

## Progress

Not started.
