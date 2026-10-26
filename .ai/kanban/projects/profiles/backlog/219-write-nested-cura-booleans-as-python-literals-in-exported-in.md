---
id: 219
title: Write nested Cura booleans as Python literals in exported .inst.cfg
type: bug
priority: P2
effort: S
model: sonnet
area: [export]
sprint: "VSS:SP13"
created: 2026-10-26
---

PRF-213 writes top-level booleans as `True`/`False`; booleans inside a list or object still go through `JSON.stringify` and come out as `true` (review sp12-rev-prf-130).

**Code:** `vsslicer/modules/profiles-cura/src/adapters/export/cura/write.ts` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] A boolean nested in a list or object value is written as a Python literal, with a test that fails without the fix
- [ ] **Bounds:** nesting depth of the value written stays bounded, with a hostile test

## Progress

Not started.
