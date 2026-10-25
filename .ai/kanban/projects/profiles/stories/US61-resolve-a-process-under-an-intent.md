---
id: US61
title: "Resolve a process under an intent"
status: reviewed
epic: VSS:E57
---

As a user or another module, I want to resolve a process with an intent and to list the intents available for a printer, material and process, so that choosing 'strong' or 'visual' changes the resolved values the way Cura's intent layer does.

## Acceptance criteria

- [ ] `resolve` with an intent applies the matching override blocks over the quality and records the intent entity in the provenance trail; without an intent the result is unchanged
- [ ] `listIntents` returns the categories that exist for the tuple, always including the default
- [ ] The resolve result exposes `intent` for the slicer modules (CuraEngine and the slicer interface)

## Out of scope

- Slicer-side intent selection (the slicer boards consume the result).
