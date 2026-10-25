---
id: US31
title: "Scarf seams, adaptive layer height and bridge detection reach the G-code"
status: reviewed
epic: VSS:E30
---

As a user, I want seam, layer height and bridging features to pass through, so that I get parity with the engines' own slicers.

## Acceptance criteria

- [ ] Scarf or sloped seams (P1): Orca `seam_slope_*`, Cura `scarf_joint_seam_length`; Z varies along the seam segment
- [ ] Adaptive layer height, automatic (P1): non-uniform layer heights on a curved fixture; if the pinned Orca CLI cannot do it the entry is `unsupported` with the reason (the variable layer height editor is VWR's)
- [ ] Bridge detection over sparse infill (P1): Orca `internal_bridge_*`; a bridge role over sparse infill

## Out of scope

- Nothing beyond the epic's own Out list
