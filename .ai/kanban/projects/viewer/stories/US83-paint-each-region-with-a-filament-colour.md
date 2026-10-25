---
id: US83
title: "Paint each region with a filament colour"
status: reviewed
epic: VSS:E52
---

As a user with a multi-material printer, I want to paint a filament onto faces of a model, so that each region prints in the filament I chose.

## Acceptance criteria

- [ ] A filament picker built from the project's filaments paints any tool in colour mode, including more than four filaments
- [ ] A painted index whose filament is missing shows a warning on the object
- [ ] Painted filament regions round-trip and the Orca CLI's G-code changes tool where painted (checked in US84) (§3 Multi-material (colour) painting)
- [ ] Other extensions can read which filaments an object's paint uses (export `paintedFilaments`)
- [ ] A painted multi-colour print on the H2C is an optional manual check (D5)

## Out of scope

- Multi-material assignment UI and flush volumes (slicer project)
- Texture-to-colour (P3)
