---
id: 89
title: Test random Project round trips through write and read
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP24"
depends_on: [87]
created: 2026-10-25
---

A generator of random `Project` values and the property test that writing then reading gives an equal project.

**Code:** `vsslicer/modules/3mf/test/property/` (module: `3mf`, layer: n/a (tests))

## Acceptance criteria

- [ ] Generators cover plates, objects, parts of every volume kind, instances, transforms and per-object config
- [ ] 1000 random projects round trip equal in CI; a failing seed is printed
- [ ] A deliberately dropped field makes the test fail (meta-test)

## Tasks

- [ ] Generators
- [ ] Property test
- [ ] Meta-test

## Progress

Not started.
