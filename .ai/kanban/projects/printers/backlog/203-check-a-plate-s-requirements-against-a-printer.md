---
id: 203
title: "Check a plate's requirements against a printer"
type: feature
priority: P2
effort: M
model: opus
area: [fleet]
story: US56
milestone: "VSS:M4"
sprint: "VSS:SP34"
depends_on: [201]
created: 2026-10-25
---

Pure `check(requires, printerFacts)` returning `ok | warn | blocked` with machine and human reasons for model, nozzle and material.

**Code:** `vsslicer/modules/fleet-queue/src/domain/...` (module: `fleet-queue`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture printers and materials: nozzle mismatch, material mismatch, model mismatch each blocked with the reason; unknown material warns
- [ ] Material matching is type plus colour, behind one function so the rule agreed with the filament project replaces it
- [ ] H2C dual-nozzle facts handled (any matching toolhead for a single-nozzle plate)

## Tasks

- [ ] Facts type
- [ ] Matchers
- [ ] Fixture tests

## Progress

Not started.
