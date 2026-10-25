---
id: 49
title: "Spike: Bambu push_status and PrusaLink position fields"
type: spike
priority: P1
effort: S
model: opus
area: [live]
story: US17
milestone: "VSS:M1"
created: 2026-10-25
---

The position type must not freeze on guesses. Needs a recorded H2C `push_status` capture from the printers project (PRN), which may not exist yet; if so, ask the owner on the board for a capture or freeze `{layer, percent?}` as unverified.

## Acceptance criteria

- [ ] A note in `.reference/notes/` records which fields Bambu reports (H2C firmware version recorded) and whether PrusaLink reports byte offsets into `.bgcode`
- [ ] The note proposes the final position type, recorded as a decision on the VSS board if it changes the plan

## Tasks

- [ ] Read ha-bambulab and PrusaLink docs
- [ ] Inspect the recorded capture
- [ ] Write the note

## Progress

Not started.
