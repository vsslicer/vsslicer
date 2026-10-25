---
id: US60
title: "Klipper adaptive bed mesh keys reach the start G-code"
status: reviewed
epic: VSS:E64
---

As a Klipper user, I want `bed_mesh_*` settings to reach my start G-code, so that the mesh covers only the printed area.

## Acceptance criteria

- [ ] The `bed_mesh_*` keys reach the `BED_MESH_CALIBRATE` parameters in the start G-code (effect test on Orca)
- [ ] The key has a capability entry for each engine; the engine without it warns
- [ ] The parsed start G-code shows the mesh bounds for a fixture object

## Out of scope

