---
id: US4
title: "A catalogue maintainer has one entry shape, one group list and canonical Orca key names"
status: reviewed
epic: VSS:E11
---

A maintainer of the settings catalogue gets a single entry type (group, home entity, type, unit, enum, bounds, default, per-extruder flag, label, tooltip, native names, conversion, override scope) so that all five slicers' keys land under Orca's names (D9) and the form and engine adapters read one source.

## Acceptance criteria

- [ ] The entry type and the 14 FFF group list exist; `sla` and `milling` are reserved and rejected
- [ ] Each setting records where it may be overridden (plate, object, part, height range) for the object-editing epic
- [ ] Prefixed keys (`prusa.`, `cura.`, `bambu.`) are allowed only where no canonical Orca key exists
- [ ] An entry with no group or home entity fails validation

## Out of scope

- SLA and milling groups (E58).
