---
id: 5
title: Fail the build on phantom dependencies
type: feature
priority: P0
effort: S
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
depends_on: [3, 4]
created: 2026-10-25
---

Regression test for hoisting: a library that imports a package missing from its own `package.json` must fail `build`.

## Acceptance criteria

- [ ] A fixture library `fixtures/phantom-dep` importing an undeclared package makes `pnpm turbo run build` fail with the package named
- [ ] The test runs in CI as a negative test (expected failure) and passes when the build fails
- [ ] pnpm `strict` settings (no `shamefully-hoist`) are asserted in `.npmrc`

## Tasks

- [ ] Create the fixture and its `PROVENANCE.md`
- [ ] Write a script that expects failure
- [ ] Add it to the root `test` task

## Progress

Not started.
