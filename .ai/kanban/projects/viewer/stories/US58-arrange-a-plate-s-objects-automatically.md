---
id: US58
title: "Arrange a plate's objects automatically"
status: reviewed
epic: VSS:E35
---

As a user with a full plate, I want Arrange to pack the objects by their footprint with a chosen spacing and optional rotation, inside the printable area and outside excluded areas, so that I do not need the engine CLI to arrange.

## Acceptance criteria

- [ ] Arrange of a plate or of the selection places every object that fits inside the printable area with no polygon overlaps, respecting spacing and the printer's exclusion areas
- [ ] Each run is one undoable command; a running arrange can be cancelled and then leaves the model unchanged
- [ ] Items that cannot fit are reported by name and left where they were, never placed off-bed silently
- [ ] Verified only on fixtures (D5)

## Out of scope

- Sequential-print gantry clearance beyond a simple radius; IDEX arrange; wipe-tower placement
