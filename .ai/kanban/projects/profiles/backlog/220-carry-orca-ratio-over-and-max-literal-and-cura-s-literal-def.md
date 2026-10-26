---
id: 220
title: "Carry Orca ratio_over and max_literal, and Cura's literal default beside formulas, in the catalogue"
type: feature
priority: P1
effort: M
model: sonnet
area: [form]
story: US29
milestone: "VSS:M2"
created: 2026-10-26
---

From the PRF-69 spike (`vsslicer/modules/profiles-extension/docs/widget-spike.md`): the catalogue drops Orca's `ratio_over` and `max_literal` on `float_or_percent` entries and Cura's literal `default_value` beside `{expr}` defaults, so the form can neither resolve a percent for display nor catch "42" typed as mm.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/` and its catalogue generator (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] `float_or_percent` entries carry `ratioOver` and `maxLiteral` from OrcaSlicer@09aa0114 `PrintConfig.cpp`, checked against upstream values for at least five keys
- [ ] Cura `{expr}` entries keep the literal `default_value` beside the formula
- [ ] **Bounds:** generator input keeps its existing size caps; new string fields have a length bound

## Progress

Not started.
