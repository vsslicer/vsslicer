---
id: 11
title: "Write tools/check-licence for package fields, SPDX headers and ported-file provenance"
type: feature
priority: P1
effort: M
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [9, 6]
created: 2026-10-25
---

Catches what Open VSX would reject and ports without provenance (D2): `package.json` licence field, SPDX header in every source file, upstream copyright line next to every `Ported from <project>@<commit>:<path>` line.

## Acceptance criteria

- [ ] Fixture with a missing `license` field fails
- [ ] Fixture source file without the SPDX header fails
- [ ] Fixture with `Ported from` but no upstream copyright line fails
- [ ] The real repository passes; the check runs in the `lint` task and in CI

## Tasks

- [ ] Define rules and ignore list
- [ ] Implement the checker
- [ ] Write failing fixtures and vitest tests
- [ ] Wire into CI

## Progress

Not started.
