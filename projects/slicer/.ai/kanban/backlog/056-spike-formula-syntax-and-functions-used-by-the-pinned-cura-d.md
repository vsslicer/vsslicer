---
id: 56
title: "Spike: formula syntax and functions used by the pinned Cura definitions"
type: spike
priority: P1
effort: S
model: opus
area: [cura]
story: US13
milestone: "VSS:M3"
depends_on: [55]
created: 2026-10-25
---

Counts and lists every syntax form and function in `value` and `enabled`-style formulas in `fdmprinter.def.json` and the printer definitions at the pinned Cura revision, and chooses the supported subset. Also pins the Uranium revision for ported `SettingFunction` semantics.

**Code:** `vsslicer/modules/cura-settings/` (module: `cura-settings`, layer: n/a (spike))

## Acceptance criteria

- [ ] A table of function and syntax forms with counts, the supported subset and the excluded forms, with the Cura and Uranium commit hashes
- [ ] Every formula in the pinned definitions is classified supported or unsupported by a script

## Tasks

- [ ] Clone and read the definitions
- [ ] Script the survey
- [ ] Record the subset

## Progress

Not started.
