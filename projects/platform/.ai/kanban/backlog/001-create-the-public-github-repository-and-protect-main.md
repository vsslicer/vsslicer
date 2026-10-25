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
sprint: "VSS:SP2"
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

Not started.
