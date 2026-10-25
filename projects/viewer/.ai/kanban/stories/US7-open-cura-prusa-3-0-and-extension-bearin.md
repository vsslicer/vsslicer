---
id: US7
title: "Open Cura, Prusa 3.0 and extension-bearing 3MF files with a notice"
status: reviewed
epic: VSS:E8
---

As a user with an unusual 3MF, I want it to open with whatever can be read and a clear notice about what was not, so that I get my geometry and never a failure for an unsupported extra.

## Acceptance criteria

- [ ] Cura workspace `Cura/*.cfg` files are read as raw INI containers beside the core model
- [ ] A Prusa 3.0 alpha file is detected and opened as core model plus preserved parts
- [ ] A file requiring the Slice, Beam Lattice, Volumetric, Boolean, Displacement or Secure Content extension is detected and opens read-only with a notice; lib3mf WASM is not shipped
- [ ] A dialect reader can be disabled so that the file falls back to core plus preserved parts
- [ ] Verified only on fixtures (D5)

## Out of scope

- Reading the Prusa 3.0 JSON layout (re-checked at beta)
