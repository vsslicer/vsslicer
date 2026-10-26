---
id: 68
title: Add diagnostics for errors the schema cannot express
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US28
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [59, 67, 140]
created: 2026-10-25
---

A `DiagnosticCollection` for unknown parent, cycle, unparsable `when` and unmapped key.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/diagnostics/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Editing a profile to name an unknown parent gives a diagnostic within 1 s; fixing it clears it
- [ ] Cycle, unparsable `when` and unmapped key each have a diagnostic with a range on the right line (tests)

## Tasks

- [ ] Map store diagnostics to ranges
- [ ] Debounce and clear
- [ ] Integration tests

## Progress

Not started.
