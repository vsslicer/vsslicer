---
id: US12
title: "A Bambu owner syncs the loaded AMS filaments to the project"
status: reviewed
epic: VSS:E21
---

As a Bambu owner, I want a 'Sync AMS to project' command that returns the filaments loaded in the AMS to the caller, so that the slicing profile can adopt them.

## Acceptance criteria

- [ ] The command returns the loaded filaments (tray, type, colour, remain) from the fixture AMS state and from the H2C
- [ ] The profile write is not done here (PRF owns profiles); the returned shape is documented for PRF

## Out of scope

- Writing profiles; Spoolman feedback (FIL).
