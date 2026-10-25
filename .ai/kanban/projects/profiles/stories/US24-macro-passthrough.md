---
id: US24
title: "G-code macro text survives import, resolve and export unchanged"
status: reviewed
epic: VSS:E13
---

A user's start, end, layer and toolchange G-code comes through every importer and back out byte-exact, with a warning when exported to a slicer with a different macro language.

## Acceptance criteria

- [ ] Start/end/layer/toolchange G-code from every importer survives store, resolve and export byte-exact
- [ ] Cross-dialect export (`prusa-macro` to Cura or the reverse) warns naming key and dialects

## Out of scope

- Evaluating macros (the engine does); a placeholder catalogue (E6).
