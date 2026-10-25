---
id: US55
title: "Use a different printer for a plate"
status: reviewed
epic: VSS:E34
---

As a user with more than one printer, I want to pick a printer instance per plate and have that plate's settings resolve against it, so that two plates can print on two machines from one project.

## Acceptance criteria

- [ ] A plate may reference a printer instance other than the project's; its config layer resolves against that printer
- [ ] Two plates with two printer instances each resolve and slice against their own printer (Orca CLI)
- [ ] An object outside the bed of its plate's printer is flagged
- [ ] The reference is saved in our namespace and the file reopens with both; the save notice states the interop limit (a second printer is lost in Orca)
- [ ] Verified only on fixtures and the Orca CLI (D5)

## Out of scope

- Sending to the printers (PRN)
