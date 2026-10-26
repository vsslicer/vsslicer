---
id: 19
title: Record meta-tests proving each harness turns CI red
type: chore
priority: P1
effort: S
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP5"
depends_on: [16, 18]
created: 2026-10-25
---

New CI usually fails silent, so a throwaway branch proves each harness can fail. The pull request records the three red runs.

## Acceptance criteria

- [ ] A failing vitest test, a failing `@vscode/test-electron` test and a changed Playwright snapshot each turn the job red; run links recorded in `CONTRIBUTING.md`
- [ ] The throwaway branch is deleted afterwards

## Tasks

- [ ] Push the three breaking branches
- [ ] Record links
- [ ] Delete branches

## Progress

Not started.
