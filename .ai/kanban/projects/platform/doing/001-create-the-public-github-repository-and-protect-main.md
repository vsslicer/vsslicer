---
id: 1
title: Create the public GitHub repository and protect main
type: chore
priority: P0
effort: S
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP9"
owner: PLT-1-worker
created: 2026-10-25
---

Gives the project its remote (D10): public so CI minutes are free and the AGPL source link works. Needs the owner's GitHub account or organisation; ask on the board if unknown.

## Acceptance criteria

- [ ] Public repository exists with the AGPL-3.0 licence detected by GitHub
- [ ] `main` requires pull requests and the CI check; force-push disabled
- [ ] Remote URL and the owner/organisation recorded in `CONTRIBUTING.md`

## Tasks

- [ ] Ask the owner for the account or organisation name (`board.py ask`)
- [ ] Create repository and push settings
- [ ] Configure branch protection and issue templates
- [ ] Record the URL

## Progress

Local parts done (not verified on GitHub; nothing created or pushed). Waiting on owner answer to Q7.

- `.github/rulesets/main.json`: PR required, required check `ci` (PLT-9 must name its job `ci`), force-push and deletion blocked. JSON parses.
- `vsslicer/tools/github/apply-repo-settings.sh [--dry-run] <owner/repo>`: enables issues, disables wiki, POSTs the ruleset. Dry-run output checked; never run for real.
- `.github/ISSUE_TEMPLATE/`: bug_report.yml, feature_request.yml, config.yml.
- Text for CONTRIBUTING.md "Repository" section is in `.reference/notes/PLT-1-github-repo.md` (PLT-6 owns the file).

Remaining: create the public repo and push (after Q7), run the apply script, confirm GitHub detects AGPL-3.0, record the URL in CONTRIBUTING.md.
