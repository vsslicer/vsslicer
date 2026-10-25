---
id: 207
title: Persist the multi-material settings in the plate 3MF and read them back
type: feature
priority: P2
effort: M
model: sonnet
area: [multimaterial]
story: US56
milestone: "VSS:M5"
sprint: "VSS:SP30"
depends_on: [206, VWR-91]
created: 2026-10-25
---

Saves tower, flush matrix, purge targets, feature assignment and nozzle map in the plate settings of the project and reads them on reopen.

**Code:** `vsslicer/modules/slicer-extension/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] Round trip through `@vsslicer/3mf` writes and reads every field without loss for the fixture plates (compare as objects)
- [ ] The Orca-readable keys appear under Orca's names in `project_settings.config` and plate settings
- [ ] A file saved by Orca with these settings opens with the same values

## Tasks

- [ ] Mapping to 3MF keys
- [ ] Save and load
- [ ] Round trip tests with fixtures

## Progress

Not started.
