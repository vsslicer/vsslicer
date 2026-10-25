---
id: 206
title: Build the printable region from a bed shape and exclusion areas
type: feature
priority: P1
effort: M
model: sonnet
area: [arrange]
story: US58
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [205]
created: 2026-10-25
---

Turns rectangular, circular and custom polygon beds with exclusion areas into the region items may occupy, with containment tests.

**Code:** `vsslicer/modules/arrange/src/domain/bed/` (module: `arrange`, layer: `domain`)

## Acceptance criteria

- [ ] Inside, touching and outside cases for each bed kind
- [ ] Exclusion areas cut holes in the region
- [ ] A circular bed polygonises within 0.05 mm of the true circle

## Tasks

- [ ] Region builder
- [ ] Containment
- [ ] Tests

## Progress

Not started.
