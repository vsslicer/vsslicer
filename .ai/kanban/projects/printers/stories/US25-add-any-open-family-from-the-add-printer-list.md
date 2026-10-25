---
id: US25
title: "A user adds a Moonraker, OctoPrint, PrusaLink or Duet printer from one list"
status: reviewed
epic: VSS:E23
---

As a printer owner, I want all four open families registered in `vsslicer.printers` and available in 'Add printer', so that the extension works without installing a second extension.

## Acceptance criteria

- [ ] The four adapters are registered with the registry and loaded in the agent
- [ ] 'Add printer' shows the families and the discovered hosts, with the declared auth scheme for each
- [ ] Each family's hardware checklist for contributors is linked from the module README

## Out of scope

- Vendor adapters (E60).
