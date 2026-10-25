---
id: US12
title: "Scrub a time-interpolated toolhead through the print"
status: reviewed
epic: VSS:E5
---

As a user, I want a timeline that plays the print with a toolhead moving at the firmware-planned speed, so I see what the printer will actually do over time.

## Acceptance criteria

- [ ] Toolhead position at time t matches the planner trapezoid within 0.01 mm in unit tests covering accel, cruise, decel, zero-length moves, moves shorter than the accel distance, arcs, G4 pauses and tool changes
- [ ] Timeline plays, pauses, steps and changes speed on the corpus
- [ ] The extruded path is drawn up to the toolhead

## Out of scope

- Live follow (US18)
