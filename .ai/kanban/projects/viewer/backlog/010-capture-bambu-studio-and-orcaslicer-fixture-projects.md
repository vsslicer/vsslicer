---
id: 10
title: Capture Bambu Studio and OrcaSlicer fixture projects
type: chore
priority: P0
effort: M
model: sonnet
area: [3mf]
story: US4
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [PLT-13]
created: 2026-10-25
---

Our own exports from released Bambu Studio and OrcaSlicer: a multi-plate project with objects, parts, instances, per-object settings, a sliced `.gcode.3mf`, and an Orca file carrying a `BambuStudio-` Application string. Fixtures must be our own exports so their licence is clear.

**Code:** `vsslicer/fixtures/3mf/bambu/`, `fixtures/3mf/orca/` (module: `3mf`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Each fixture is under 5 MB and has `PROVENANCE.md` with writer, version, settings and licence
- [ ] Contains at least two plates, a multi-part object, an instance, custom G-code per layer and one painted triangle attribute
- [ ] One fixture is an Orca export with `BambuStudio-` in the Application string
- [ ] Where the CLI cannot export, the owner exports from the GUI (OWNER default noted in the PR)

## Tasks

- [ ] Export with each slicer
- [ ] Reduce to the size cap
- [ ] Write PROVENANCE.md

## Progress

Not started.
