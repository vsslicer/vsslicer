---
id: 60
title: Write the catalogue generator for the slicer C++ sources
type: feature
priority: P2
effort: M
model: opus
area: [language]
story: US47
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [59]
created: 2026-10-25
---

A script that reads `s_CustomGcodeSpecificPlaceholders` and `CustomGcodeSpecificConfigDef` (`new_def` and `def->add` forms) from a slicer checkout and writes the catalogue JSON. Both slicers use the same structure (`OrcaSlicer@09aa0114` `PrintConfig.cpp:13656-13793`; `PrusaSlicer@30ef591` legacy `PrintConfig.cpp:6414-6468`).

**Code:** `vsslicer/modules/gcode-templates/src/adapters/...` (module: `gcode-templates`, layer: `adapters`)

## Acceptance criteria

- [ ] On the pinned commits it produces files that equal the committed ones byte for byte; an input with an unparsable entry fails with the line number instead of dropping it
- [ ] Each output entry records the slicer, commit and file:line it came from
- [ ] The script writes only into the module's data folder

## Tasks

- [ ] Parser for the two C++ shapes
- [ ] Provenance
- [ ] Determinism test

## Progress

Not started.
