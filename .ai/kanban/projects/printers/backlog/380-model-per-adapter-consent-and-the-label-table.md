---
id: 380
title: Model per-adapter consent and the label table
type: feature
priority: P2
effort: S
model: sonnet
area: [unofficial]
story: US73
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [379]
created: 2026-10-25
---

Pure model: each adapter has a label kind (`official protocol` or `reverse engineered`) and a consent record (none, accepted for a consent-text version, declined); changing the text version asks again.

**Code:** `vsslicer/modules/apps/printers-unofficial/src/application/...` (module: `printers-unofficial-extension`, layer: `application`)

## Acceptance criteria

- [ ] Accepting stores the version; declining stores nothing that allows a connection; reset clears one or all (unit tests)
- [ ] Official adapters need no consent by default and reverse-engineered ones always do
- [ ] The adapter table lists exactly: SDCP, Repetier-Server, Creality K2, Elegoo CC2, Anycubic LAN, Snapmaker SACP (no AnkerMake)

## Tasks

- [ ] Types
- [ ] Consent state machine
- [ ] Tests

## Progress

Not started.
