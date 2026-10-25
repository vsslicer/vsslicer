---
id: US26
title: "Assign spools to printer slots from the view"
status: reviewed
epic: VSS:E43
---

As a printer owner, I want commands and tree actions to set the spool in a printer tool or AMS tray and to resolve unassigned-bucket entries, so that I never use the command line for slots.

## Acceptance criteria

- [ ] Printers are listed through `PrinterRegistry`; assign, move and clear work from the tree
- [ ] Unassigned-bucket entries show an "Assign" action that moves the usage

## Out of scope

- Tag-driven assignment (E44)
