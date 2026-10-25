---
id: D3
title: "Printers: Bambu Lab first, over an open-source networking implementation, behind a generic printer API"
status: accepted
date: 2026-10-25
cards: [10, 9, 17]
question: Q3
---

## Context

The roadmap put the open ecosystems (Moonraker, OctoPrint, PrusaLink, Duet) in phase 4 and
Bambu LAN control in phase 7, with Developer Mode LAN only, no cloud, and asked (Q3) whether
LAN-only Bambu control is acceptable and whether reverse-engineered vendor adapters should ship.

## Decision

The owner answered Q3 on 2026-10-25: **"For now, target Bambu, via the open source
bamboo-networking plugin. Create a generic API for printer access (extensible of course)."**

Recorded as the planner reads it; approving confirms the reading:

1. **Generic API first.** `@vsslicer/printer-api` (`PrinterAdapter`, `Session`, `Discoverer`,
   `CameraSource`, normalised status, capability flags) is the first epic of the printers
   initiative (I4), designed so that any vendor or firmware is one adapter package.
2. **Bambu is the first adapter.** The Bambu adapter ships in I4, not I7. It is built on the
   open-source Bambu networking implementation the owner named ("bamboo-networking plugin"): the
   first PRN task is a spike that identifies that project exactly, records its licence and
   revision, and decides whether we depend on it, port it (D2 allows porting AGPL and GPL code),
   or re-implement from it. Transport scope: Developer Mode LAN (MQTT/TLS 8883, FTPS 990,
   `.gcode.3mf` send, AMS mapping) first; cloud mode is allowed when the open implementation
   provides it and the user opts in, which drops the roadmap's "no cloud in R2–R4" rule for
   Bambu only.
3. **Open ecosystems follow.** Moonraker, OctoPrint, PrusaLink and Duet are the second adapter
   epic of I4 and still ship before the first end-to-end slicing release (I5), because the
   API's generality is only proven by a second adapter family.
4. **Reverse-engineered vendor adapters** (Creality, Anycubic, Elegoo CC2, AnkerMake) stay in
   I10, opt-in and labelled; the owner's answer did not rule them out or in.
5. **Test hardware** is the owner's Bambu H2C (D5), so every Bambu capability table starts with
   that model and firmware and is dated.

## Alternatives

- Open ecosystems first, Bambu in phase 7 (the roadmap order): more printers covered earlier,
  but the owner's own printer would be unsupported for months and the API would be designed
  without the hardest adapter in view.
- Bambu only: fastest for the owner, but the "generic API" would be unproven.

## Consequences for the plan

- I4 becomes "Printers: generic API, Bambu, open ecosystems, daemon, export to storage".
- I2 (3MF, `.gcode.3mf` reading and writing of the Bambu layout) must finish before I4's Bambu
  send; it does in the proposed order.
- I7 (cameras) starts with the Bambu H2C camera path and the daemon's loopback proxy.
- If the owner picks differently: swap the order of the two adapter epics on PRN; nothing else
  moves.
