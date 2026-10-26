---
id: 66
title: "Spike: which printers expose OpenPrintTag over their API"
type: spike
priority: P2
effort: S
model: opus
area: [tags]
story: US33
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [14]
created: 2026-10-25
---

Read Prusa firmware and PrusaLink docs for Core One and MK4 with reader: do they expose the NDEF payload through an API? If none, the parser ships behind the capability flag and the OpenPrintTag half waits on PRN.

**Code:** `vsslicer/modules/filament/docs/` (module: `filament`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A written note with sources (repo@commit or doc URL) and a verdict per printer family
- [ ] The note says what capability flag and event shape a connector would need to publish

## Tasks

- [ ] Read firmware and docs
- [ ] Write the note

## Progress

Not started.
