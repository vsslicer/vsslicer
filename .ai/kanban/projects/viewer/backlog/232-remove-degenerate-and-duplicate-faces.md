---
id: 232
title: Remove degenerate and duplicate faces
type: feature
priority: P1
effort: S
model: sonnet
area: [mesh, repair]
story: US63
milestone: "VSS:M4"
sprint: "VSS:SP31"
depends_on: [230, 43]
created: 2026-10-25
---

Removes zero-area and repeated faces. Ported from `OrcaSlicer@09aa0114:deps_src/admesh/*` (GPL-2.0-or-later, combinable with AGPL under GPL-3.0 section 13) (D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/core/mesh/src/domain/repair/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] The sliver and duplicate fixtures lose exactly those faces, matching admesh's counts
- [ ] Removed counts appear in the report
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Detection
- [ ] Removal
- [ ] Tests

## Progress

Not started.
