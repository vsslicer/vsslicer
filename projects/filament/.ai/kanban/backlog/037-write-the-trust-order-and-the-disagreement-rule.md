---
id: 37
title: Write the trust order and the disagreement rule
type: feature
priority: P1
effort: M
model: sonnet
area: [consumption]
story: US18
milestone: "VSS:M4"
depends_on: [21]
created: 2026-10-25
---

Pure rules: pick the booked source in the order Moonraker `filament_used`, Bambu `used_g`, slicer total; keep the others as observations; flag a disagreement above max(5 g, 10 percent) (settings).

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Table-driven tests over source combinations pick the expected booked source and keep the rest as observations
- [ ] Differences just below and just above max(5 g, 10 percent) flag correctly, with the thresholds taken from settings values passed in

## Tasks

- [ ] Write the rules
- [ ] Table tests

## Progress

Not started.
