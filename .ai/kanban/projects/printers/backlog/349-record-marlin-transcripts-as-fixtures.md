---
id: 349
title: Record Marlin transcripts as fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [serial]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [344]
created: 2026-10-25
---

Transcripts of `M115`, `M105`, `M20`, `M27`, resend and busy exchanges for the parser and emulator tests, derived from the `Marlin@2ef3ee6` source (`Marlin/src/gcode/host/M115.cpp:135,211-221`) and the Marlin documentation, because no Marlin printer is available (D5).

**Code:** `vsslicer/modules/printer-serial/test/fixtures/` (module: `printer-serial`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] PROVENANCE.md states for every transcript whether it was recorded from a device or derived from the cited source, and that no Marlin code is copied
- [ ] At least three firmware generations are covered (1.1.x, 2.0.x, 2.1.x) with long-filename support on and off, plus a BFT-capable reply
- [ ] The fixtures check (size cap and PROVENANCE) passes

## Tasks

- [ ] Derive transcripts from M115.cpp and the docs
- [ ] Write PROVENANCE
- [ ] Run the fixtures check

## Progress

Not started.
