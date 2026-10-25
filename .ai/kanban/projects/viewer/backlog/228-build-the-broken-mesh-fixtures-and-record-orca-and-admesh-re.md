---
id: 228
title: Build the broken-mesh fixtures and record Orca and admesh results
type: chore
priority: P1
effort: M
model: sonnet
area: [mesh, repair]
story: US63
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [35, 45]
created: 2026-10-25
---

Fixtures with open edges, flipped normals, duplicate faces, small holes, self-intersections and zero-area slivers, with admesh's report and Orca's repaired volume recorded once per fixture and a PROVENANCE.md.

**Code:** `vsslicer/modules/mesh/test/fixtures/broken/` (module: `mesh`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] One fixture per defect class plus a mixed one, each with the admesh report and Orca volume (versions recorded)
- [ ] A fixture with a large missing region exists for the unrepairable case
- [ ] The fixtures check passes

## Tasks

- [ ] Create or collect meshes
- [ ] Run admesh
- [ ] Run Orca repair by hand
- [ ] Record

## Progress

Not started.
