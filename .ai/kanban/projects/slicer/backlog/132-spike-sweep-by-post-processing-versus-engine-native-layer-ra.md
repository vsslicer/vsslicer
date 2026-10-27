---
id: 132
title: "Spike: sweep by post-processing versus engine-native layer-range modifiers"
type: spike
priority: P2
effort: M
model: opus
area: [calibration]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [131, 30, 82, GCP-4, GCP-57]
created: 2026-10-25
---

Slices a temperature tower both ways on Orca and CuraEngine and decides how sweeps are applied: a post-processing step at layer changes (engine-independent but fights the engine's own temperature commands) or layer-range modifiers in the 3MF.

**Code:** `vsslicer/modules/core/calibration/` (module: `calibration`, layer: n/a (spike))

## Acceptance criteria

- [ ] A report in `docs/research/` shows, for both engines and both methods, the parsed temperature per block (parser state-change table) and whether the engine's own `M104`/`M109` (first layer, layer-change G-code) overrides an injected value
- [ ] The report states the decision, the injection point that survives each engine's start and layer-change G-code, and the firmware commands checked
- [ ] The decision is stated in one paragraph that later cards in this epic quote

## Tasks

- [ ] Slice the tower both ways on Orca (`slicer-orca@0.1.0`) and CuraEngine (`slicer-cura@0.1.0`)
- [ ] Parse the outputs and tabulate temperature per block
- [ ] Write the report and the decision

## Progress

Not started.
