---
id: US1
title: "Open a 3MF package and keep every part it contains"
status: reviewed
epic: VSS:E8
---

As a library consumer (the viewer, the G-code parser, the slicer output), I want to open a 3MF package and list its parts, content types, relationships and thumbnails with every unknown part kept as raw bytes, so that nothing a slicer wrote is ever lost or misread.

## Acceptance criteria

- [ ] `openPackage(bytes)` exposes `Package.parts` with name, content type, relationships and raw bytes for every part, including parts the reader does not understand
- [ ] `[Content_Types].xml`, `_rels/.rels`, part relationships and thumbnails are read; `requiredextensions` is checked and an unsupported one is reported, not ignored
- [ ] Each error class has a fixture, a typed error and a user-facing message: corrupt zip, missing root model, malformed XML, unsupported required extension, declared size above the cap (zip bomb)
- [ ] The container layer is published as the first increment so GCP's `.gcode.3mf` reader and SLC's output can use it
- [ ] Verified only on fixtures (D5)

## Out of scope

- Writing or changing parts (US2)
- Model content (US3)
