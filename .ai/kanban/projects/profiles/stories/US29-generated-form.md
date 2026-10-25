---
id: US29
title: "A user edits any setting of a process, material or printer in a generated form"
status: reviewed
epic: VSS:E15
---

A user opens a profile and edits any of its settings in a form whose pages, fields and widgets are generated from the catalogue, so a new catalogue key appears with no UI code.

## Acceptance criteria

- [ ] A snapshot of the generated form model (groups, fields, widget kinds) for the full catalogue; a catalogue change shows as a reviewed snapshot diff
- [ ] A key added to the catalogue fixture appears without a code change; every one of the 14 FFF groups renders with a widget chosen from its type
- [ ] Percent-or-absolute values stay relative; per-extruder tables write keyed values; G-code shows its dialect badge; Cura formulas are read-only
- [ ] Usability spike on five percent-or-absolute and five Cura formula keys is recorded before the widgets freeze

## Out of scope

- The add-printer wizard (E17); SLA and milling pages (E58).
