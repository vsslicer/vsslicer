---
id: 231
title: Merge vertices exactly and within a tolerance
type: feature
priority: P1
effort: M
model: sonnet
area: [mesh, repair]
story: US63
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [230, 42]
created: 2026-10-25
---

Exact vertex merge and tolerant merge of near-duplicate vertices (the admesh exact and nearby checks). Ported from `OrcaSlicer@09aa0114:deps_src/admesh/*` (GPL-2.0-or-later, combinable with AGPL under GPL-3.0 section 13) (D2), with the notice and a `Ported from` line.

**Code:** `vsslicer/modules/mesh/src/domain/repair/` (module: `mesh`, layer: `domain`)

## Acceptance criteria

- [ ] The fixtures lose their duplicate vertices; the result equals admesh's vertex count within the tolerance rule
- [ ] Tolerance zero equals the exact merge
- [ ] Notice and `Ported from` line present

## Tasks

- [ ] Exact merge
- [ ] Tolerant merge
- [ ] Tests

## Progress

Not started.
