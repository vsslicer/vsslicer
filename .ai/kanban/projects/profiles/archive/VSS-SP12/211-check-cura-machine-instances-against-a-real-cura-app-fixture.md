---
id: 211
title: Check Cura machine instances against a real Cura app fixture
type: chore
priority: P2
effort: S
model: sonnet
area: [importers]
sprint: "VSS:SP12"
depends_on: [127]
created: 2026-10-26
---

Criterion 1 of PRF-127, carried: check `readCuraMachineInstances` against a machine instance saved by a real Cura app (Q27), since PRF-127's fixtures were hand-built from Cura and Uranium source.

**Code:** `vsslicer/modules/profiles-cura/test/fixtures/` and `test/instances.test.ts` (module: `profiles-cura`, layer: n/a (fixture))

## Acceptance criteria

- [ ] A real Cura machine instance (global stack, extruder stack, definition_changes; credentials removed) is a fixture with its Cura version in PROVENANCE.md
- [ ] `readCuraMachineInstances` imports it: model, nozzle and connection as Cura shows them, with a test

## Progress

Closed without work (sp11-coordinator): the owner answered Q27 "Hand-built fixtures are enough", so no real-app fixture is needed.
