---
id: 32
title: Add the ha-bambulab mock_data and delta-merge fixture pairs
type: chore
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [31, 30, PLT-13]
created: 2026-10-25
---

Fixtures for the status tests: ha-bambulab `mock_data` (MIT) and pairs of full X1-style and partial P1-style pushes.

**Code:** `vsslicer/modules/printer-bambu/test/fixtures/` (module: `printer-bambu`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] Fixtures have a PROVENANCE.md naming `ha-bambulab@<commit>:path`; the fixtures check passes
- [ ] At least one fixture pair per behaviour: full push, partial push, AMS change, HMS entry, `fun` flag on and off

## Tasks

- [ ] Copy fixtures with provenance
- [ ] Build the pairs
- [ ] Run the fixtures check

## Progress

Not started.
