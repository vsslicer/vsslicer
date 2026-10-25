---
id: 3
title: Convert filament length to grams and refuse a missing density
type: feature
priority: P1
effort: S
model: sonnet
area: [model]
story: US1
milestone: "VSS:M4"
depends_on: [2]
created: 2026-10-25
---

g = pi * (d/2)^2 * L * rho / 1000 (d and L in mm, rho in g/cm3). A missing density is a typed error, never a default.

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Matches Spoolman's `use_length` conversion on a table of fixtures computed from `Spoolman@488eb74:spoolman/database/spool.py:1161`
- [ ] A missing or zero density raises `MissingDensityError`, asserted by test; the caller must surface it

## Tasks

- [ ] Write the conversion
- [ ] Compute the oracle table
- [ ] Tests

## Progress

Not started.
