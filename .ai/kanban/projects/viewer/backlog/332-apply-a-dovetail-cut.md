---
id: 332
title: Apply a dovetail cut
type: feature
priority: P2
effort: M
model: opus
area: [mesh]
story: US88
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [324, 331, 329]
created: 2026-10-25
---

Cuts with a dovetail: one half gets the tongue added and the other the groove subtracted, and both carry the cut identity.

**Code:** `vsslicer/modules/mesh-boolean/src/application/dovetail.ts` (module: `mesh-boolean`, layer: `application`)

## Acceptance criteria

- [ ] The halves stay closed manifold and sum to the original volume within the tongue volume and 0.5 percent
- [ ] Cut identity matches between halves
- [ ] Three dovetails in one cut work (count option)

## Tasks

- [ ] Apply tongue and groove
- [ ] Tests

## Progress

Not started.
