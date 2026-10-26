---
id: 10
title: Enforce DCO sign-off in CI
type: feature
priority: P1
effort: S
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M7"
owner: PLT-10-worker
depends_on: [9]
created: 2026-10-25
---

D10 chose the DCO over a CLA. A CI job (a small script, not a paid bot) checks every commit of a pull request for `Signed-off-by` matching the author.

## Acceptance criteria

- [x] A fixture history with an unsigned commit fails the check; a signed history passes (script test)
- [ ] The job is a required status check
- [x] `CONTRIBUTING.md` explains `git commit -s`

## Tasks

- [x] Write `vsslicer/scripts/check-dco.mjs` (card said `tools/check-dco`)
- [x] Add the workflow job
- [x] Add script tests and docs

## Progress

Done locally (not moved to review: criterion 2 cannot be verified, there is no remote, Q7):
- `vsslicer/scripts/check-dco.mjs <base> <head>`: every non-merge commit in base..head needs `Signed-off-by: Name <email>` equal to the author's name and email (email case-insensitive). A sign-off by someone else fails (decision: the DCO certifies the contributor's own submission). Merge commits are skipped.
- Tests `vsslicer/scripts/test/check-dco.test.mjs` build a temp git repo: signed passes, unsigned fails naming the commit, other-person sign-off fails, merge skipped. Runner tests: 43 pass (`cd vsslicer/scripts && node --test test/`).
- `.github/workflows/ci.yml`: `dco` job (pull_request only, SHA-pinned actions, workflow-level read-only permissions), wired into the `ci` aggregate (success or skipped). The ruleset already requires `ci`, so `dco` is required through it; `.github/rulesets/main.json` is unchanged.
- `CONTRIBUTING.md` Sign-off section: `git commit -s`, the checker command, how to fix.

Left: criterion "the job is a required status check" - after the repo exists, import the ruleset and confirm on a real pull request that `ci` fails when a commit is unsigned (workflow itself never run).

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answers Q7 and Q13 ("Move them to a later milestone until I set up the remote/accounts"); Q8 (no marketplace accounts). This card needs the GitHub remote, CI on it or marketplace accounts, so it leaves the sprints until the owner sets them up.
