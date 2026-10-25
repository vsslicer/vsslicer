---
id: US58
title: "A user sends one plate to many printers with one action"
status: reviewed
epic: VSS:E47
---

As a owner of a printer farm, I want to pick printers and send the same plate to all of them, so that each printer is checked and each starts its own job.

## Acceptance criteria

- [ ] Select printers, check each one, enqueue one item per printer; incompatible printers are listed with the reason and skipped or fixed by the user
- [ ] One action sends a plate to the H2C and a fixture Moonraker printer and both start
- [ ] Both produce history records linked to the plate

## Out of scope

- Automatic choice of printers.
- Slicing a different G-code per printer.
