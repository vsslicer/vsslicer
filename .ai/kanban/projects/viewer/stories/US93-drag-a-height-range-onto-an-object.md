---
id: US93
title: "Drag a height range onto an object"
status: reviewed
epic: VSS:E54
---

As a user, I want to drag a Z band on an object to give that band its own settings, so that I can change infill or speed only in part of a model.

## Acceptance criteria

- [ ] Dragging creates a layer-range entry snapped to layers and opens its override form; handles resize and move it
- [ ] Overlaps and ranges outside the object are refused with the reason
- [ ] Ranges are undoable commands and appear in the height-range table
- [ ] Verified only on fixtures (D5) (§3 Height-range modifiers)

## Out of scope

- Layer height profile editing (US92)
