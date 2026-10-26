---
id: 49
title: Implement resolve with a provenance trail
type: feature
priority: P0
effort: L
model: opus
area: [store]
story: US22
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [44, 135]
created: 2026-10-25
---

`resolve(printerInstance, material[], process) -> {unified, provenance}`: inheritance chains, `overrides` by `when`, per-extruder keys, and for every key which entity set it.

**Code:** `vsslicer/modules/profiles/src/application/resolve/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] For hand-built tuple fixtures shaped like the Prusa, Orca and Cura ones (small copies with PROVENANCE.md) `resolve` equals the expected values, including an H2C 0.4 nozzle + PLA Basic + 0.20 mm Standard shaped tuple, with provenance; the real-importer run is the extension's tuple test
- [ ] Provenance lists, for each resolved key, the entity id (and override block) that last set it; a test changes one parent and the trail follows
- [ ] Multi-material resolution handles two materials on a dual-nozzle instance fixture
- [ ] Unresolved parent gives a diagnostic and the best-effort resolution

## Tasks

- [ ] Build the chain per entity
- [ ] Apply overrides with context
- [ ] Record provenance
- [ ] Tests on the tuple fixtures

## Progress

Not started.
