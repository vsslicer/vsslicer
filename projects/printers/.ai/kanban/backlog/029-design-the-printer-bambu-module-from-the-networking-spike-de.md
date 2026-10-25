---
id: 29
title: Design the printer-bambu module from the networking spike decision
type: spike
priority: P1
effort: M
model: opus
area: [bambu]
story: US7
milestone: "VSS:M3"
sprint: "VSS:SP10"
depends_on: [1]
created: 2026-10-25
---

First E21 card: turn the PRN-1 decision (depend, port or re-implement) into a module design and the list of protocol facts to record from the H2C.

**Code:** `vsslicer/modules/printer-bambu/docs/` (module: `printer-bambu`, layer: `n/a (docs)`)

## Acceptance criteria

- [ ] `docs/design.md` names the implementation, licence file text, commit, the dependency mode and the module layout (which parts are ported with notices and a `Ported from` line)
- [ ] Lists the H2C facts to capture (firmware, `fun` flag, CA chain, accepted commands) and the MQTT/FTPS libraries chosen
- [ ] If PRN-1 changes D3's reading, an owner decision is proposed on the VSS board

## Tasks

- [ ] Read the PRN-1 note and decision
- [ ] Write the design
- [ ] List capture items

## Progress

Not started.
