---
id: US62
title: "Use feature and role-change G-code hooks"
status: reviewed
epic: VSS:E64
---

As an Orca or SuperSlicer user, I want my role-change hooks to pass through or be reported, so that none vanishes silently.

## Acceptance criteria

- [ ] Orca `change_extrusion_role_gcode` and its process and filament variants pass through; an effect test sees the hook text at role changes
- [ ] SuperSlicer `feature_gcode` is mapped where the unified schema models it and otherwise reported unsupported with a warning
- [ ] Timelapse and other hook keys are handled by the same table (US63)

## Out of scope

- The placeholder catalogue and template editor (GCP)
