---
id: US16
title: "Get hovers and completion for G-code commands"
status: reviewed
epic: VSS:E6
---

As someone who edits G-code, I want a hover that explains each command and parameter for my firmware flavour and completion of commands and parameters, so I do not keep a wiki open.

## Acceptance criteria

- [ ] Every catalogued command has a hover; completion offers commands and parameters for the detected flavour
- [ ] Hover and completion integration tests per flavour, including M204 on Marlin vs Klipper and M572 on RRF vs Buddy
- [ ] Catalogue lint fails CI for an entry without a source link and flavour list
- [ ] Slicer tag comments (`;TYPE:`, `; FEATURE:`) have hovers
- [ ] Files over 50 MB open in the preview and the language features say why they are unavailable
- [ ] Descriptions are written by us; none copied

## Out of scope

- Language server, formatting
