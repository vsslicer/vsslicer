---
id: 399
title: "Check the Bambu objects golden against Bambu Studio's GUI"
type: chore
priority: P2
effort: S
model: sonnet
area: [3mf]
sprint: "VSS:SP48"
depends_on: [22]
created: 2026-10-26
---

Criterion 1 of VWR-22, carried: compare `vsslicer/modules/core/3mf/test/fixtures/real/auto_pa_line_single.golden.json` with the fixture opened in Bambu Studio 2.x (object and part names, part types, extruders, positions), since VWR-22's golden was checked against the file's XML only (Q28).

**Code:** `vsslicer/modules/core/3mf/test/fixtures/real/` (module: `3mf`, layer: n/a (fixture))

## Acceptance criteria

- [ ] The owner's GUI comparison is recorded, and any difference is fixed in the reader or the golden with a test

## Progress

Not started. Needs the owner's Bambu Studio (Q28).
