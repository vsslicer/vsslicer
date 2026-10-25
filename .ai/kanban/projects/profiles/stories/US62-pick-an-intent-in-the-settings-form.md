---
id: US62
title: "Pick an intent in the settings form"
status: reviewed
epic: VSS:E57
---

As a user editing a process in the settings form, I want an intent picker next to the quality, so that I choose 'strong' or 'visual' instead of editing keys.

## Acceptance criteria

- [ ] The process form shows an intent field whose options come from `listIntents` for the selected printer and material; choosing one shows the effective values and their source
- [ ] With no intents available the field is hidden, not empty
- [ ] The choice is stored on the user's process as `intent`

## Out of scope

- Choosing an intent in the slicer's own process selection (slicer boards).
