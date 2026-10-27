---
id: 30
title: Test that all dialects read into one Project shape
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US9
milestone: "VSS:M2"
sprint: "VSS:SP17"
depends_on: [23, 26, 27, 28]
created: 2026-10-25
---

A schema-level test over every fixture: plates, objects, parts, instances, per-object config and raw project config are present in the same typed structure.

**Code:** `vsslicer/modules/core/3mf/test/` (module: `3mf`, layer: n/a (ci))

## Acceptance criteria

- [ ] Every fixture validates against one `Project` schema
- [ ] A golden JSON per fixture is checked in and diffed in CI
- [ ] A dropped plate or object fails the test

## Tasks

- [ ] Schema
- [ ] Goldens
- [ ] Test

## Progress

Not started.
