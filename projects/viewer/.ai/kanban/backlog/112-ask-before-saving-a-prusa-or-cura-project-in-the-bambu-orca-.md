---
id: 112
title: Ask before saving a Prusa or Cura project in the Bambu/Orca shape
type: feature
priority: P1
effort: S
model: sonnet
area: [editor]
story: US33
milestone: "VSS:M4"
depends_on: [109, 98]
created: 2026-10-25
---

On Save of a foreign-dialect project, a modal names what is converted and what is kept only as preserved parts; the default is Save As and the original is untouched unless the user confirms the overwrite.

**Code:** `vsslicer/modules/project-extension/src/presentation/editor/` (module: `project-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The dialog appears for Prusa 2.x and Cura fixtures with the conversion report listed
- [ ] Choosing Save As writes a new file and leaves the original untouched
- [ ] Choosing overwrite requires one more confirmation
- [ ] No dialog for Bambu and Orca sources

## Tasks

- [ ] Dialog
- [ ] Wire to conversion
- [ ] Test host test

## Progress

Not started.
