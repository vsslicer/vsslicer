---
id: 19
title: Record meta-tests proving each harness turns CI red
type: chore
priority: P1
effort: S
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M7"
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

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answers Q7 and Q13 ("Move them to a later milestone until I set up the remote/accounts"); Q8 (no marketplace accounts). This card needs the GitHub remote, CI on it or marketplace accounts, so it leaves the sprints until the owner sets them up.
