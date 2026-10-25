---
id: 442
title: Write vendor contributor checklists and ToS review notes
type: docs
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US74
milestone: "VSS:M5"
sprint: "VSS:SP46"
depends_on: [381]
created: 2026-10-25
---

One checklist per vendor (what to verify on the printer, how to attach a recorded session as a fixture) and one terms-of-service review note per reverse-engineered adapter, signed off by the owner before that adapter ships.

**Code:** `vsslicer/modules/printers-unofficial-extension/docs/` (module: `printers-unofficial-extension`, layer: `n/a (docs)`)

## Acceptance criteria

- [ ] Checklists exist for SDCP, Repetier-Server, Creality K2, Elegoo CC2, Anycubic LAN and Snapmaker; each says CI makes no hardware claim (D5)
- [ ] A ToS review note exists for each of the four reverse-engineered adapters with the sources read and a sign-off line; the extension release is blocked without it (a CI check on the notes)

## Tasks

- [ ] Write checklists
- [ ] Write ToS note template and notes
- [ ] Add the CI check

## Progress

Not started.
