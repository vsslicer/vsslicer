---
id: 79
title: "Extend the golden corpus to PrusaSlicer, SuperSlicer, Cura and Bambu multi-material"
type: chore
priority: P2
effort: M
model: sonnet
area: [parser]
story: US1
depends_on: [2, 10]
created: 2026-10-25
---

Module: `gcode-parser` (test fixtures). Module model: `.ai/instructions.md` "Architecture rules" and D12.

The rest of GCP-2's corpus, pushed to a much later sprint by the owner (Q11: "focus on Bambu/Orca style G-code for now"). Needs the slicers installed or GUI exports from the owner (Q9 said don't install for SP2).

## Acceptance criteria

- [ ] PrusaSlicer: a 20 mm calibration cube and a multi-material (MMU) sample under 5 MB, arc fitting on and off, generating version recorded
- [ ] SuperSlicer: a calibration cube and a multi-material sample, arcs off (the current sample is ArcWelder post-processed)
- [ ] Cura: a multi-material sample
- [ ] Bambu Studio: a multi-material sample (the CLI can't slice multi-extruder; GUI export)
- [ ] GCP-10's arc checks run on the PrusaSlicer arc-fitted fixture; goldens regenerated and cross-checked

## Tasks

- [ ] Ask the owner for the slicers or GUI exports
- [ ] Add fixtures with PROVENANCE.md and manifest entries
- [ ] Regenerate and cross-check goldens

## Progress

Not started.
