---
id: 95
title: Implement the add-printer step model with compatibility filtering
type: feature
priority: P0
effort: L
model: opus
area: [wizard]
story: US39
milestone: "VSS:M2"
sprint: "VSS:SP11"
depends_on: [50, 91, 49, 135]
created: 2026-10-25
---

A pure state machine: vendor, model, nozzle per toolhead, surface, feeder, materials (compatible only), optional connection, summary; finishing creates the instance. Vendor data comes from whatever entities are in the store.

**Code:** `vsslicer/modules/profiles/src/application/wizard/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With hand-built entity fixtures shaped like Prusa, Orca-vendor, Bambu and Cura printers, the steps produce an instance whose `resolve` equals the expected tuple values; the real-adapter run is the extension's wizard integration test
- [ ] The material step lists exactly the materials compatible with the model and nozzle (oracle: evaluator over fixture conditions, incl. a Prusa `nozzle_diameter[0]!=0.6` case; a 0.6 mm material is never offered for a 0.4 mm nozzle)
- [ ] A dual-nozzle model asks for a nozzle per toolhead

## Tasks

- [ ] Define the step state machine
- [ ] Compatibility per step
- [ ] Finish builds the instance
- [ ] Tests per ecosystem

## Progress

Not started.
