---
id: US2
title: A contributor opens a pull request and sees lint, build and unit tests run on three operating systems with a cache
status: reviewed
epic: VSS:E1
---

A contributor pushes a branch and GitHub Actions runs the Turborepo pipeline on ubuntu, macos and windows with vitest for libraries, saving the Turborepo cache between runs, so a broken change is red before review and unchanged packages are skipped.

## Acceptance criteria

- [ ] `pnpm turbo run lint build test` passes on the ubuntu, macos and windows runners; a second run with the restored cache reports cache hits for unchanged packages
- [ ] A deliberately failing vitest test turns the CI job red (meta-test on a throwaway branch, recorded in the pull request)
- [ ] CI uses only free public-repository minutes (no paid runners, no remote cache)

## Out of scope

- Integration and snapshot jobs (US4); release workflow (US6).
