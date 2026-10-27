---
id: 18
title: Run the 3MF Consortium conformance suite in CI
type: chore
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US3
milestone: "VSS:M7"
depends_on: [17, PLT-9]
created: 2026-10-25
---

Runs the `test_suites` core and Production cases (BSD-2-Clause) fetched at CI time, not committed.

**Code:** `vsslicer/modules/core/3mf/test/conformance/` (module: `3mf`, layer: n/a (ci))

## Acceptance criteria

- [ ] Every positive case parses; every negative case fails with the expected error class (mapping table in the repo)
- [ ] Suite version is pinned and its licence recorded in `PROVENANCE.md`
- [ ] CI fails when a case regresses

## Tasks

- [ ] Fetch and pin the suite in CI
- [ ] Write the runner and the expected-error mapping
- [ ] Wire into CI

## Progress

Not started.

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answers Q7 and Q13 ("Move them to a later milestone until I set up the remote/accounts"); Q8 (no marketplace accounts). This card needs the GitHub remote, CI on it or marketplace accounts, so it leaves the sprints until the owner sets them up.
