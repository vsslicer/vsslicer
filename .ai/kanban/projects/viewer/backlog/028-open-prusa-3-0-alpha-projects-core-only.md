---
id: 28
title: Open Prusa 3.0 alpha projects core-only
type: feature
priority: P1
effort: S
model: sonnet
area: [3mf]
story: US7
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [20, 11]
created: 2026-10-25
---

A Prusa 3.0 alpha file is detected and opened as core model plus preserved parts with a notice; the JSON layout is not parsed until beta.

**Code:** `vsslicer/modules/3mf/src/application/` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] The 3.0 alpha fixture opens with objects from the core model and a notice that the project config is preserved but not read
- [ ] Parts are preserved byte-for-byte on save

## Tasks

- [ ] Route to core-only
- [ ] Notice
- [ ] Tests

## Progress

Not started.
