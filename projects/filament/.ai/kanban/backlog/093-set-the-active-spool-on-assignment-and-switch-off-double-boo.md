---
id: 93
title: Set the active spool on assignment and switch off double booking
type: feature
priority: P2
effort: S
model: sonnet
area: [spoolman]
story: US37
milestone: "VSS:M4"
depends_on: [92, 91, 46]
created: 2026-10-25
---

When a printer reports a `[spoolman]` component, assigning a spool sets Moonraker's active spool and tells `filament` (`setExternalBooking`) to skip extrusion booking for that printer.

**Code:** `vsslicer/modules/filament-spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] On recorded fixtures the active spool is set on assignment and E42 books no extrusion for that printer
- [ ] Without the component nothing changes

## Tasks

- [ ] Write the policy
- [ ] Fixture tests

## Progress

Not started.
