---
id: 97
title: Handle missing vendor data and custom printers in the wizard model
type: feature
priority: P0
effort: M
model: sonnet
area: [wizard]
story: US41
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [95, 135]
created: 2026-10-25
---

When the vendor's data is absent the model reports what is missing and the actions that could fix it (a list of data sources the composition root registers: the Orca/Bambu data package, the Prusa upstream download); a custom printer starts from `printer_model` defaults (Orca `fdm_*_common` abstract presets).

**Code:** `vsslicer/modules/profiles/src/application/wizard/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With no vendor data and offline, the model state names what is missing and how to get it and still allows a custom printer
- [ ] A custom printer built from `fdm_*_common` defaults resolves a valid process
- [ ] Each failure (missing data, offline download) has a step message (tests)

## Tasks

- [ ] Missing-data state
- [ ] Custom printer defaults
- [ ] Tests

## Progress

Not started.
