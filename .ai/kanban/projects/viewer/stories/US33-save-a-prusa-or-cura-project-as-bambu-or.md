---
id: US33
title: "Save a Prusa or Cura project as Bambu/Orca only after I confirm"
status: reviewed
epic: VSS:E31
---

As a user who opened a PrusaSlicer 2.x or Cura project, I want the editor to ask before it converts the project to the Bambu/Orca shape and to name what is converted and what is kept only as preserved parts, so that I never overwrite my original by accident.

## Acceptance criteria

- [ ] Prusa 2.x and Cura sources save through a conversion with a report naming converted data and data kept only as preserved parts
- [ ] The conversion dialog appears for Prusa 2.x and Cura sources; the default is Save As and the original file is untouched unless the user confirms the overwrite
- [ ] Verified only on fixtures (D5)

## Out of scope

- Writing PrusaSlicer or Cura native projects (noted as an owner question)
