---
id: 18
title: Run snapshot tests on Linux in CI and add a regenerate workflow
type: feature
priority: P1
effort: S
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M7"
depends_on: [17]
created: 2026-10-25
---

Snapshots are only valid on the Linux runner; a manually triggered workflow regenerates them and opens a pull request.

## Acceptance criteria

- [ ] CI runs `test:snapshot` on ubuntu only
- [ ] The regenerate workflow uploads new snapshots as a pull request
- [ ] Playwright reports and diffs upload on failure

## Tasks

- [ ] Add the CI job
- [ ] Add the dispatch workflow
- [ ] Verify the diff artefact

## Progress

Not started.

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answers Q7 and Q13 ("Move them to a later milestone until I set up the remote/accounts"); Q8 (no marketplace accounts). This card needs the GitHub remote, CI on it or marketplace accounts, so it leaves the sprints until the owner sets them up.
