---
id: US4
title: "Detect which slicer wrote a 3MF"
status: reviewed
epic: VSS:E8
---

As a user opening someone else's project, I want VSSlicer to tell which slicer and dialect wrote the file, so that the right reader runs and nothing is misread as another slicer's project.

## Acceptance criteria

- [ ] Dialect is detected from the `Application` metadata prefix `BambuStudio-`, the `OrcaSlicer` metadata tag, the Prusa projectfile relationship with the 2.99.1 legacy cut-off, and the `Cura/` folder
- [ ] Detection is correct on every fixture, including an Orca file carrying a `BambuStudio-` Application string and a Prusa 3.0 alpha file
- [ ] Fixture projects exist from Bambu Studio, OrcaSlicer, PrusaSlicer 2.9, Cura and a Prusa 3.0 alpha, our own exports, with writer versions recorded in `PROVENANCE.md`
- [ ] Verified only on fixtures (D5)

## Out of scope

- Reading dialect content (US5 to US7)
