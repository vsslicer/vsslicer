---
id: 295
title: Rename Prusa 2.x paint channels in the conversion and drop them from the generic export with a report entry
type: feature
priority: P2
effort: S
model: sonnet
area: [3mf, painting]
story: US84
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [93, 95, 293, 294]
created: 2026-10-25
---

Converting a PrusaSlicer 2.x project to the Bambu/Orca shape writes its paint under the Bambu/Orca attribute names; the generic export has no vendor parts, so it drops paint and says so in the report.

**Code:** `vsslicer/modules/3mf/src/adapters/convert/paint.ts` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The converted Prusa fixture's `paint_*` strings equal the source strings; supports, seams and colours map to the right names
- [ ] The generic export contains no paint attribute and the conversion report lists what was dropped, by name
- [ ] Strings the target cannot represent are kept raw and listed

## Tasks

- [ ] Rename map
- [ ] Report entries
- [ ] Tests

## Progress

Not started.
