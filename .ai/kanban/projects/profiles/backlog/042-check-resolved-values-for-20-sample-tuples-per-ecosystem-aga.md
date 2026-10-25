---
id: 42
title: Check resolved values for 20 Prusa tuples against the oracle
type: feature
priority: P0
effort: L
model: opus
area: [importers]
story: US19
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [21, 25, 34, 135]
created: 2026-10-25
---

Compares resolved (printer, nozzle, material, process) values with PrusaSlicer's last-parent-wins rule, using `profile-api` merge and overrides.

**Code:** `vsslicer/modules/profiles-prusa/test/tuples/` (module: `profiles-prusa`, layer: n/a (fixtures and tests))

## Acceptance criteria

- [ ] At least 20 tuples (Prusa and SuperSlicer) equal the oracle chosen by the oracle spike (upstream CLI export, else hand-checked expectations citing `profiles.md` lines)
- [ ] A seeded merge-order bug makes the suite fail
- [ ] Fixtures only (D5)

## Tasks

- [ ] Pick the tuples
- [ ] Produce the oracle values
- [ ] Write the comparison tests

## Progress

Not started.
