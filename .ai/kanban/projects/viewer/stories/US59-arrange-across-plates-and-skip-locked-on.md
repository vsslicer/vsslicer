---
id: US59
title: "Arrange across plates and skip locked ones"
status: reviewed
epic: VSS:E35
---

As a user with several plates, I want Arrange to spill objects onto new plates and to leave locked plates alone, so that a large job spreads over plates without touching finished ones.

## Acceptance criteria

- [ ] Objects that do not fit on the first plate go to the next plate and to new plates when allowed, up to the 36 plate limit
- [ ] Locked plates never change; the plate invariant property test runs over arrange
- [ ] Verified only on fixtures (D5)

## Out of scope

- Auto-orient (E55)
