---
id: 183
title: "Resolve a plate's settings against its own printer and flag objects outside its bed"
type: feature
priority: P1
effort: M
model: opus
area: [plates]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [182, 179, 181, PRF-140]
created: 2026-10-25
---

Resolves printer, material and process for the plate's printer instance, reads `printable_area` and the exclusion areas, and flags instances whose footprint is outside.

**Code:** `vsslicer/modules/apps/project/src/application/plateResolve.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Two plates with two printer fixtures resolve different bed sizes
- [ ] An object outside its plate's printer bed is flagged by name
- [ ] A plate with no reference uses the project's printer

## Tasks

- [ ] Resolve per plate
- [ ] Bed from resolved keys
- [ ] Flagging

## Progress

Not started.
