---
id: 129
title: Check resolved values for 20 Cura tuples against the oracle
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [21, 31, 135]
created: 2026-10-25
---

Compares resolved values with the Cura stack order using `profile-api` merge and overrides.

**Code:** `vsslicer/modules/profiles-cura/test/tuples/` (module: `profiles-cura`, layer: n/a (fixtures and tests))

## Acceptance criteria

- [ ] At least 20 tuples equal the oracle chosen by the oracle spike; stack order definition, extruder, variant, quality, user proven
- [ ] A seeded merge-order bug makes the suite fail
- [ ] Fixtures only (D5)

## Tasks

- [ ] Pick the tuples
- [ ] Produce the oracle values
- [ ] Write the comparison tests

## Progress

Not started.
