---
id: 265
title: "Spike: PrusaSlicer substitution semantics versus JavaScript RegExp"
type: spike
priority: P2
effort: M
model: opus
area: [postprocess]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP41"
created: 2026-10-25
---

Reads `prusa3d/PrusaSlicer@version_2.9.x:src/libslic3r/GCode/FindReplace.cpp` (tag to be pinned here) and the Prusa documentation to define the semantics: the four-field rule format, flags `i`, `w`, `m`, `s` (and regex mode), whole-word handling, and every Boost-versus-JavaScript difference (lookbehind, `\b`, named groups, replacement syntax).

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (spike))

## Acceptance criteria

- [ ] A document in `docs/research/` lists each flag's exact behaviour, the rule serialisation of `gcode_substitutions` including quoting, and a table of regex constructs: same, translated, unsupported
- [ ] It states the pinned PrusaSlicer tag and the Cura SearchAndReplace parameter names and where Cura stores them in a profile
- [ ] Unsupported constructs are listed with the failure message they will produce

## Tasks

- [ ] Read the Prusa source and docs
- [ ] Try constructs in PrusaSlicer 2.9.x
- [ ] Write the document

## Progress

Not started.
