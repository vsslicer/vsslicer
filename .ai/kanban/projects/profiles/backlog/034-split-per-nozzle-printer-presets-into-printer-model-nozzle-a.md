---
id: 34
title: "Split per-nozzle Prusa printer presets into printer_model, nozzle and overrides"
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US15
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [25, 135]
created: 2026-10-25
---

Imported Prusa printer presets that exist once per nozzle become one `printer_model`, `nozzle` entities and `overrides`, and `printer_notes` keyword tests become tags.

**Code:** `vsslicer/modules/profiles-prusa/src/application/import/split/` (module: `profiles-prusa`, layer: `application`)

## Acceptance criteria

- [ ] The MK4S 0.4/0.6 fixture yields 1 printer_model + 2 nozzles; resolving model plus nozzle equals the original preset values
- [ ] `printer_notes` keyword tests are tagged through the tag table; an unknown keyword gives a diagnostic
- [ ] The native form of each original preset stays attached for export

## Tasks

- [ ] Detect nozzle variants
- [ ] Extract overrides
- [ ] Tag printer_notes
- [ ] Tests

## Progress

Not started.
