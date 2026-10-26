---
id: 128
title: Check resolved values for 20 Orca and Bambu tuples against the oracle
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [21, 28, 126, 135]
created: 2026-10-25
---

Compares resolved (printer, nozzle, material, process) values with the Orca rules (parent, then includes, then own keys), using `profile-api` merge and overrides.

**Code:** `vsslicer/modules/profiles-orca/test/tuples/` (module: `profiles-orca`, layer: n/a (fixtures and tests))

## Acceptance criteria

- [ ] At least 20 tuples including the H2C 0.4 nozzle with Bambu PLA Basic and the 0.20 mm Standard process equal the oracle chosen by the oracle spike (upstream CLI export, else hand-checked expectations citing `profiles.md` lines)
- [ ] A seeded merge-order bug makes the suite fail
- [ ] Fixtures only; the H2C hardware is not used (D5)

## Tasks

- [ ] Pick the tuples
- [ ] Produce the oracle values
- [ ] Write the comparison tests

## Progress

Not started.
