---
id: US26
title: "Use the 3MF library from other projects"
status: reviewed
epic: VSS:E8
---

As the owner of profile import, Bambu sends or `.gcode.3mf` assembly, I want a stable, documented API for embedded presets, plate G-code and part replacement, so that my feature does not reach into reader internals.

## Acceptance criteria

- [ ] `@vsslicer/3mf` exports `openPackage`, `Package.parts`, `replacePart`/`addPart`/`removePart`, `save`, `readProject` and the `Project` types from one entry point
- [ ] Accessors return embedded preset blobs (Bambu JSON, Prusa INI, Cura containers) for E12, and plate G-code, its MD5 and plate metadata for E21 and E3, without parsing
- [ ] Public API is documented and checked for accidental change in CI
- [ ] Verified only on fixtures (D5)

## Out of scope

- Anything outside this story's epic
