---
id: 10
title: Enforce DCO sign-off in CI
type: feature
priority: P1
effort: S
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [9]
created: 2026-10-25
---

D10 chose the DCO over a CLA. A CI job (a small script, not a paid bot) checks every commit of a pull request for `Signed-off-by` matching the author.

## Acceptance criteria

- [ ] A fixture history with an unsigned commit fails the check; a signed history passes (script test)
- [ ] The job is a required status check
- [ ] `CONTRIBUTING.md` explains `git commit -s`

## Tasks

- [ ] Write `tools/check-dco`
- [ ] Add the workflow job
- [ ] Add script tests and docs

## Progress

Not started.
