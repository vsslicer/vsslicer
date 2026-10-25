---
id: US27
title: "Get a warning when my profile sets a key the engine does not support"
status: reviewed
epic: VSS:E30
---

As a user, I want one warning per unsupported key at slice time, so that I know why a setting had no effect.

## Acceptance criteria

- [ ] Slicing with an unsupported key set gives exactly one warning per key in Problems, never an error and never silent
- [ ] The warning travels through the same channel as engine warnings (US19)

## Out of scope

- Greying out keys in the form (PRF)
