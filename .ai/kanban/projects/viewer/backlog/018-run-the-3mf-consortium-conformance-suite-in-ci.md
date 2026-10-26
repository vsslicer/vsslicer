---
id: 18
title: Run the 3MF Consortium conformance suite in CI
type: chore
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [17, PLT-9]
created: 2026-10-25
---

Runs the `test_suites` core and Production cases (BSD-2-Clause) fetched at CI time, not committed.

**Code:** `vsslicer/modules/3mf/test/conformance/` (module: `3mf`, layer: n/a (ci))

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
