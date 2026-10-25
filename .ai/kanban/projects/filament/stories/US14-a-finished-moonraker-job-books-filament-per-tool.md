---
id: US14
title: "A finished Moonraker job books filament per tool"
status: reviewed
epic: VSS:E42
---

As a Klipper owner, I want `print_stats.filament_used` at job end booked per tool to the assigned spools, so that my inventory follows my prints.

## Acceptance criteria

- [ ] A recorded Moonraker job end books the expected event per tool on the assigned spool
- [ ] Verified on recorded fixtures only (no Klipper hardware, D5)

## Out of scope

- Moonraker's own Spoolman component (E45)
