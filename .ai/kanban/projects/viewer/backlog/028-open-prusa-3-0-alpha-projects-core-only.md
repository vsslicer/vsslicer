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
sprint: "VSS:SP9"
depends_on: [20]
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

**Dependency on VWR-11 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with VWR-11.
