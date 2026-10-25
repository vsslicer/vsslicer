---
id: 118
title: "Assemble the Duet adapter, probe RRF versus DSF and start with M32"
type: feature
priority: P0
effort: M
model: sonnet
area: [duet]
story: US22
milestone: "VSS:M3"
depends_on: [116, 117, 84]
created: 2026-10-25
---

One `PrinterAdapter` that probes the board (`rr_connect` or DSF) and picks the client.

**Code:** `vsslicer/modules/printer-duet/src/application/...` (module: `printer-duet`, layer: `application`)

## Acceptance criteria

- [ ] Contract kit passes for RRF and DSF fixtures; start uses `M32`
- [ ] `docs/hardware-checklist.md` for contributors

## Tasks

- [ ] Probe and selection
- [ ] Kit run
- [ ] Checklist

## Progress

Not started.
