---
id: 347
title: "Spike: does the Orca CLI follow layer_heights_profile.txt and layer_config_ranges.xml"
type: spike
priority: P2
effort: M
model: opus
area: [3mf, editor]
story: US94
milestone: "VSS:M5"
sprint: "VSS:SP47"
depends_on: [274, SLC-30, SLC-42, GCP-4, GCP-5]
created: 2026-10-25
---

The epic's open risk: the Orca CLI may ignore a saved profile in some modes. Slices the fixture projects with the CLI in the modes the slicer adapter uses and compares the layer Z values in the G-code with the saved profile, so the first story does not build on a wrong assumption.

**Code:** `.reference/notes/` (module: `project-extension`, layer: n/a (spike))

## Acceptance criteria

- [ ] For each CLI mode used by the adapter the note states whether the profile and the ranges were honoured, with the layer Z lists compared
- [ ] If a mode ignores them, the note names the workaround (a setting, a different mode, or a limit to document) and what a profile versus a range `layer_height` override does when both exist
- [ ] A decision for the cards that depend on it; the spike code is not shipped

## Tasks

- [ ] Slice the fixtures
- [ ] Compare layer Z
- [ ] Write the decision

## Progress

Not started.
