---
id: US42
title: "Other extensions call addPrinter, and the owner adds the H2C"
status: reviewed
epic: VSS:E17
---

The slicer or a printer extension calls `vsslicer.profiles.addPrinter()`, and the owner adds `Bambu Lab H2C` with 0.4 nozzles and Bambu PLA Basic and checks the resolved process.

## Acceptance criteria

- [ ] A stub extension calls `addPrinter()`; with no discovery provider the connection step is empty
- [ ] On the H2C (D5) the wizard offers the model, both nozzles and PLA Basic, resolved values match Bambu Studio for the same selection, firmware recorded
- [ ] The connection part of the H2C check is the M3 story US38

## Out of scope

- Printer discovery (E21/E23).
