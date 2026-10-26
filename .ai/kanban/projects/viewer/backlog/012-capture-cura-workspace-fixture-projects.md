---
id: 12
title: Capture Cura workspace fixture projects
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US4
milestone: "VSS:M7"
depends_on: [PLT-13]
created: 2026-10-25
---

Own Cura workspace 3MF exports with settings containers.

**Code:** `vsslicer/fixtures/3mf/cura/` (module: `3mf`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] Under 5 MB with `PROVENANCE.md` (Cura version, licence)
- [ ] Contains `Cura/*.cfg` containers and two objects
- [ ] Also one plain Cura-exported model 3MF with no workspace

## Tasks

- [ ] Export from Cura
- [ ] Reduce to the size cap
- [ ] Write PROVENANCE.md

## Progress

Not started.

**Moved to M7 (Owner setup) at SP9 (sp9-coordinator):** owner answer Q19 ("Defer this to a later stage"): the fixture projects the owner exports from the slicers are deferred, so this card leaves the sprints.
