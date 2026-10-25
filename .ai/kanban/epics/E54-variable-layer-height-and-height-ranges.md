---
id: E54
title: Edit variable layer height and height-range modifiers interactively
status: draft
initiative: I10
project: VWR
order: 13
depends_on: [E33, E34, E31]
rows: ["§3 Variable layer height editor (adaptive, smooth, brush)", "§3 Height-range modifiers"]
---

Layer height along Z is the main quality and speed lever: this epic adds the variable layer height editor (adaptive from surface curvature, smoothing, and a manual brush on the layer-height curve) and an interactive height-range tool that places a settings range on an object by dragging in the viewer.

## Scope

In (`vsslicer.project`; layer-height maths in `@vsslicer/mesh`):
- Adaptive layer heights and smoothing ported (D2) from `OrcaSlicer@09aa0114:src/libslic3r/Slicing.cpp` (AGPL-3.0; the functions behind `Slicing.hpp:166,179`), with notices; PrusaSlicer's `Slicing` as the cross-check.
- Editor: a layer-height curve beside the object, brush to raise or lower, adaptive with a quality slider, smooth with a radius, reset; shaded bands on the object.
- Height-range tool: drag a Z band on the object to create a layer-range entry that E33's override form then edits.
- Persisted as `layer_heights_profile.txt` and `layer_config_ranges.xml` through E31; Prusa 2.x files read by E8.

Out: Cura's automatic adaptive layers (an engine setting, SLC).

## Feature-matrix rows

- §3 Variable layer height editor (P2): done when an adaptive profile computed here matches Orca's on the fixtures within a tolerance, edits round-trip, and the Orca CLI's G-code follows the profile (layer Z values checked with E10).
- §3 Height-range modifiers (P2): done when ranges created by dragging round-trip and the sliced G-code shows the override only in that range.

## Acceptance criteria

- [ ] Adaptive and smoothed profiles agree with Orca's on fixtures within 0.01 mm per sample (Orca result recorded once per fixture).
- [ ] Layer Z values in the Orca CLI's G-code match the saved profile.
- [ ] The layer-height part of the §9 persistence row (owned by E52) round-trips with Orca and Prusa 2.x fixtures.
- [ ] Brush, adaptive, smooth and range edits are undoable commands under E32's property test.
- [ ] Verified only on fixtures (D5).

## Dependencies

- Needs E33 (layer-range overrides), E34 (plate config for layer height limits), E31 (writer), E54 (min and max layer height of the printer), E10.
- Exposes the layer-height profile to SLC (passed to the engine through the 3MF).

## Risks and spikes

- The Orca CLI may ignore `layer_heights_profile.txt` in some modes; spike with SLC before the first story.

## Eng review

- Scope challenge: both rows edit Z-banded object data with the same viewer affordance, so one epic of about three sprints.
- Tests: Orca profile comparison catches port errors; G-code Z checks catch persistence the engine ignores.
- Blast radius: wrong profiles change print quality, not files' validity.
- Reversibility: reset per object; undo per edit.
- Changed because of the review: reused E33's range entries instead of a second range model.
