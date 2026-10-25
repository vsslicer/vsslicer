---
id: 1
title: "Spike: pick the XML parser and confirm raw zip entry copy"
type: spike
priority: P0
effort: S
model: opus
area: [3mf]
story: US2
milestone: "VSS:M2"
sprint: "VSS:SP5"
depends_on: [PLT-8]
created: 2026-10-25
---

Chooses the permissively licensed streaming XML parser and settles how a package is saved byte-identically (fflate raw entry copy or a local-header copier of our own). Output decides the container design.

**Code:** notes in `.reference/notes/` and a decision paragraph in `vsslicer/modules/3mf/README.md` (module: `3mf`, layer: n/a (spike))

## Acceptance criteria

- [ ] Two or more XML parsers measured on a 100 MB sub-model: licence (permissive only), streaming, speed, browser and Node support; the pick is written down with numbers
- [ ] A script shows whether fflate exposes raw compressed entries; if not, a 50-line local-header copier is prototyped and writes a zip whose entries are byte-identical to the input
- [ ] Verified on a synthetic zip only (D5)

## Tasks

- [ ] Measure candidate XML parsers
- [ ] Test fflate raw entry access
- [ ] Prototype the copier if needed
- [ ] Record the decision

## Progress

Not started.
