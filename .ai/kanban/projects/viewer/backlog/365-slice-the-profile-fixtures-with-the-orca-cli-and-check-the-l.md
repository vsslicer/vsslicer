---
id: 365
title: Slice the profile fixtures with the Orca CLI and check the layer Z values
type: feature
priority: P2
effort: M
model: opus
area: [editor]
story: US94
milestone: "VSS:M5"
sprint: "VSS:SP49"
depends_on: [358, 359, 364, 274, SLC-30, SLC-42, GCP-4, GCP-5]
created: 2026-10-25
---

Applies adaptive, smooth and brushed profiles to the fixtures, saves, reopens, slices through `slicer-orca` and reads the layer Z values from the G-code with the parser.

**Code:** `vsslicer/modules/apps/project/test/integration/layerheight-oracle/` (module: `project-extension`, layer: n/a (ci))

## Acceptance criteria

- [ ] The layer Z values in the G-code equal the saved profile's layer tops within 0.001 mm for adaptive, smooth and brushed profiles
- [ ] A saved and reopened project gives the same profile (file equal)
- [ ] If a CLI mode ignores the profile (spike), the test names the mode and asserts the documented limit
- [ ] Engine and parser versions printed; runs in CI on Linux; verified on fixtures only (D5)

## Tasks

- [ ] Harness
- [ ] Z comparison
- [ ] Round trip
- [ ] CI job

## Progress

Not started.
