---
id: US50
title: "Move objects between plates without breaking plate rules"
status: reviewed
epic: VSS:E34
---

As a user, I want to move an instance to another plate and trust that every instance is on exactly one plate, so that nothing is lost or printed twice.

## Acceptance criteria

- [ ] Plate invariants hold under property tests: every instance on exactly one plate; locked plates unchanged by any command except unlock; delete then undo restores membership and order
- [ ] Moving into a locked plate is refused with the reason
- [ ] Verified only on fixtures (D5)

## Out of scope

- Automatic placement (E35)
