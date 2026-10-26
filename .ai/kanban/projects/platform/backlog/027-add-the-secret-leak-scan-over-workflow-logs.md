---
id: 27
title: Add the secret-leak scan over workflow logs
type: chore
priority: P1
effort: S
model: sonnet
area: [publishing]
story: US6
milestone: "VSS:M7"
depends_on: [26]
created: 2026-10-25
---

GitHub masking plus a grep step over the log artefact for token prefixes, so a leak turns the job red.

## Acceptance criteria

- [ ] A rehearsal that deliberately prints a fake token with a known prefix fails the scan
- [ ] The real release run passes the scan

## Tasks

- [ ] Collect logs as an artefact
- [ ] Write the grep step with the token prefixes
- [ ] Rehearse

## Progress

Not started.

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answers Q7 and Q13 ("Move them to a later milestone until I set up the remote/accounts"); Q8 (no marketplace accounts). This card needs the GitHub remote, CI on it or marketplace accounts, so it leaves the sprints until the owner sets them up.
