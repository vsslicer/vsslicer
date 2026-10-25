---
id: 66
title: "Compute hovers: type, meaning and the kinds that provide it"
type: feature
priority: P2
effort: S
model: sonnet
area: [language]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [65]
created: 2026-10-25
---

Hover text for a placeholder or option variable: type, tooltip (the slicer's text, with provenance), whether it is a vector, and the template kinds that fill it.

**Code:** `vsslicer/modules/gcode-templates/src/application/...` (module: `gcode-templates`, layer: `application`)

## Acceptance criteria

- [ ] Every placeholder in both catalogues has a hover in each kind that provides it (generated test); the kind list in the hover equals `providedBy`
- [ ] An option variable shows its catalogue label and tooltip
- [ ] Hover outside a placeholder returns nothing

## Tasks

- [ ] Hover builder
- [ ] Catalogue-wide test

## Progress

Not started.
