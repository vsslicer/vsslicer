---
id: 48
title: Add the Enter usage manually and Measure spool on scale commands
type: feature
priority: P1
effort: S
model: sonnet
area: [consumption, ui]
story: US18
milestone: "VSS:M4"
depends_on: [16, 14]
created: 2026-10-25
---

Two commands over `Inventory.book` and `Inventory.measure`: manual entry in grams and a scale reading (gross weight) that records a correction.

**Code:** `vsslicer/modules/filament-extension/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A scale reading makes the spool's remaining weight equal reading minus empty spool weight; the correction appears in the log
- [ ] Invalid input (negative, non-numeric) is rejected with a message

## Tasks

- [ ] Write the commands
- [ ] Integration test

## Progress

Not started.
