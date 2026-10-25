---
id: 124
title: Convert Orca and Bambu compatible_printers constructs to unified conditions
type: feature
priority: P0
effort: S
model: sonnet
area: [evaluator]
story: US3
milestone: "VSS:M2"
sprint: "VSS:SP6"
depends_on: [120, 135]
created: 2026-10-25
---

The Orca/Bambu row of the `profiles.md` §6 conversion table: `compatible_printers: [names]` to `printer.id in [...]` after name-to-id mapping.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/conditions/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] `compatible_printers` converts exactly when every name resolves; an unresolved name gives a diagnostic and a lossy flag
- [ ] Every output parses and evaluates with the `profile-api` parser (release 0.1.0)

## Tasks

- [ ] Write the converter
- [ ] Write the tests

## Progress

Not started.
