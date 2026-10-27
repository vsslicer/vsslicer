---
id: 62
title: Export the oracle table of computed values from a pinned Cura release
type: chore
priority: P1
effort: M
model: opus
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP24"
depends_on: [56]
created: 2026-10-25
---

A script and the resulting fixture: resolved values for a set of (machine, extruder count, material, quality) tuples, including a two-extruder machine, computed by the pinned Cura itself. Run once by hand; the table is committed with the Cura version recorded.

**Code:** `vsslicer/modules/core/cura-settings/` (module: `cura-settings`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] The export script runs Cura's own resolution (scripted headless Python from the pinned Cura) and writes JSON per tuple
- [ ] At least five tuples including one with two extruders and one with a material override
- [ ] `PROVENANCE.md` has the Cura version, platform and command; the fixture is under the size cap

## Tasks

- [ ] Write the export script
- [ ] Run it on the owner's machine if it cannot run unattended
- [ ] Commit fixture and provenance

## Progress

Not started.
