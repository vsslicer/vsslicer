---
id: US23
title: "A user exports an imported or edited profile back to its native format losslessly"
status: reviewed
epic: VSS:E13
---

A user who imported an Orca, Prusa or Cura profile and edited it in VSSlicer exports a native file that differs from the original only by their edit.

## Acceptance criteria

- [ ] Import then export is byte-equivalent for every user preset fixture and 200 vendor presets per ecosystem
- [ ] Changing one unified key on an imported Orca process gives a file whose diff to the original is that one key
- [ ] Export refuses to overwrite without confirmation; an unknown key gives a diagnostic
- [ ] The flattened-export spike confirms byte equivalence on 10 Prusa presets

## Out of scope

- Bundle formats (E18).
