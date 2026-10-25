---
id: 126
title: "Split per-nozzle Orca printer presets into printer_model, nozzle and overrides"
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [27, 135]
created: 2026-10-25
---

Orca/Bambu machines that exist once per nozzle size become one `printer_model` with `nozzle` entities and `overrides`.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/split/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] An Orca 0.2/0.4/0.6 printer fixture becomes one `printer_model` and three `nozzle` entities; resolving model plus nozzle equals the original machine preset values
- [ ] The native form of each original preset stays attached

## Tasks

- [ ] Detect nozzle variants
- [ ] Extract overrides
- [ ] Tests

## Progress

Not started.
