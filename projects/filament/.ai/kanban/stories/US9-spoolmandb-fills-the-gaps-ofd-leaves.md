---
id: US9
title: "SpoolmanDB fills the gaps OFD leaves"
status: reviewed
epic: VSS:E41
---

As a user, I want SpoolmanDB entries added only where OFD has no matching filament, so that the catalogue is as complete as possible without duplicates.

## Acceptance criteria

- [ ] An entry that duplicates an OFD record by EAN, else by normalised (brand, material, name, diameter, net weight), is not added; a unique entry is
- [ ] Every match decision is recorded in the import report, never merged silently

## Out of scope

- SpoolmanDB sync through a Spoolman instance
