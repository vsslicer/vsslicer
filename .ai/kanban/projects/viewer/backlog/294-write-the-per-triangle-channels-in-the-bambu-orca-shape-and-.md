---
id: 294
title: Write the per-triangle channels in the Bambu/Orca shape and keep unknown ones
type: feature
priority: P2
effort: M
model: sonnet
area: [3mf, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [79, 292, 273]
created: 2026-10-25
---

Writes each channel as the attribute on `<triangle>` in the core model writer, for supports, seams, colours and every unknown attribute, and leaves a channel out when all its strings are empty.

**Code:** `vsslicer/modules/3mf/src/adapters/core/triangleAttributes.ts` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Orca and Bambu Studio fixtures written and read back give equal channels, including `paint_fuzzy_skin` and `face_property`
- [ ] A project with no paint writes no paint attribute
- [ ] An untouched project still copies the original part bytes (no rewrite)

## Tasks

- [ ] Attribute writer
- [ ] Round-trip tests

## Progress

Not started.
