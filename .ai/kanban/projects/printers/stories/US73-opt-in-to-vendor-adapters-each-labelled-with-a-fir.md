---
id: US73
title: "Opt in to vendor adapters, each labelled, with a first-use consent dialog"
status: reviewed
epic: VSS:E60
---

As a user, I want vendor adapters to be off until I install `vsslicer.printers-unofficial`, and each reverse-engineered one to tell me what it is before first use, so that I never talk to a printer through an unofficial protocol by accident.

## Acceptance criteria

- [ ] The extension registers each adapter with `vsslicer.printers` and shows its label (`official protocol` or `reverse engineered`) in Add printer and in the Printers view
- [ ] A reverse-engineered adapter asks for consent before its first connection; declining connects nothing, and the answer is stored per adapter and can be reset
- [ ] Adapters gate by firmware string and fail read-only (never write) on an unknown one, with the reason shown
- [ ] AnkerMake and any vendor cloud are absent

## Out of scope

- Choosing which vendors ship (owner decision); AnkerMake (needs account secrets).
