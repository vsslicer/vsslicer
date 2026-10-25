---
id: 18
title: Run snapshot tests on Linux in CI and add a regenerate workflow
type: feature
priority: P1
effort: S
model: sonnet
area: [ci]
story: US4
milestone: "VSS:M1"
sprint: "VSS:SP2"
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
