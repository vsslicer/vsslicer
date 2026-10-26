---
id: 11
title: Capture PrusaSlicer 2.9 and Prusa 3.0 alpha fixture projects
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US4
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [PLT-13]
created: 2026-10-25
---

Own PrusaSlicer 2.9 project exports (object with volumes, per-object settings, layer ranges) and a 3.0 alpha project.

**Code:** `vsslicer/fixtures/3mf/prusa/` (module: `3mf`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Under 5 MB each, with `PROVENANCE.md` giving writer version and licence
- [ ] The 2.9 fixture has two objects, a modifier volume, a layer range and a custom G-code per print Z
- [ ] The 3.0 alpha fixture is recorded with its build id

## Tasks

- [ ] Export with the PrusaSlicer CLI where possible
- [ ] Export 3.0 alpha
- [ ] Write PROVENANCE.md

## Progress

Not started.
