---
id: US40
title: "Get completion and hover for every Orca and Bambu placeholder in the right template kinds"
status: reviewed
epic: VSS:E50
---

As a user who writes custom G-code in an Orca or Bambu Studio profile, I want completion and hover for each placeholder the slicer fills in for that template (start, end, layer change, tool change and the rest), so that I stop guessing variable names.

## Acceptance criteria

- [ ] Every placeholder in the Orca catalogue (ported with provenance from `OrcaSlicer@09aa0114` `PrintConfig.cpp:13656` and the per-template entries from `:13661`) completes and hovers in each template kind that provides it, and only in those
- [ ] Hover shows type, meaning (the slicer's own tooltip text) and the list of template kinds that fill it
- [ ] The data files carry the AGPL-3.0 notice and `Ported from` lines (the licence check passes)

## Out of scope

- PrusaSlicer placeholders (US41); evaluating the macro language.
