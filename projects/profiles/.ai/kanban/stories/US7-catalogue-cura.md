---
id: US7
title: "The catalogue lists every Cura setting key"
status: reviewed
epic: VSS:E11
---

A maintainer gets every Cura definition and extruder key mapped to a canonical name or a `cura.` entry, with formula defaults kept verbatim.

## Acceptance criteria

- [ ] Every key of Cura@5bea2f8 `fdmprinter.def.json` and `fdmextruder.def.json` is mapped or `native_only`
- [ ] `=expr` defaults are flagged and stored as `{expr}`, never evaluated

## Out of scope

- Evaluating Cura formulas (SLC).
