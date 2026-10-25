---
id: 17
title: Extend the catalogue with Cura keys
type: feature
priority: P0
effort: M
model: opus
area: [schema]
story: US7
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [14]
created: 2026-10-25
---

Maps `Cura@5bea2f8:resources/definitions/fdmprinter.def.json` and `fdmextruder.def.json` (740 + 31 keys) onto canonical names, or `cura.` entries where none exists; `=expr` values are stored as `{expr}`.

**Code:** `vsslicer/modules/profile-api/tools/catalogue/` and `vsslicer/modules/profile-api/src/domain/catalogue/data/cura.json` (module: `profile-api`, layer: n/a (tooling and generated data))

## Acceptance criteria

- [ ] Every Cura setting key is mapped or `native_only`; extruder-scoped keys are flagged per-extruder
- [ ] Cura-only material properties from the XML key table (density, diameter, GUID) land in `material` entries, not settings
- [ ] Formula defaults are kept verbatim and flagged `expr`

## Tasks

- [ ] Extract the definitions
- [ ] Map to canonical names
- [ ] Flag per-extruder and `expr` keys

## Progress

Not started.
