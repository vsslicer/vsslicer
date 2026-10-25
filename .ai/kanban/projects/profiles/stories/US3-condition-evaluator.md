---
id: US3
title: "A profile consumer evaluates a compatibility condition safely"
status: reviewed
epic: VSS:E11
---

A developer filtering materials or processes for a printer calls `evaluate(expr, context)` on a `when` expression, with Prusa, Orca, Bambu and Cura compatibility constructs converted to one safe language that cannot run code.

## Acceptance criteria

- [ ] At least 50 conditions sampled from the 822 in `PrusaResearch.ini` and the 3.0 YAML forms match PrusaSlicer's results as computed by hand from `Preset.cpp:390-421`
- [ ] A condition that fails to parse returns compatible plus a diagnostic, as PrusaSlicer does
- [ ] Every construct in the `profiles.md` §6 conversion table has a unified form, including the per-vendor keyword-to-tag table for `printer_notes`
- [ ] The evaluator has no `eval`, `Function` or dynamic import; a fuzz test of 10 000 random inputs never throws outside its error type

## Out of scope

- Cura `=expr` evaluation (SLC); the Prusa macro language.
