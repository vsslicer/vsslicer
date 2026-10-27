---
id: 381
title: Ask for consent before first use and add vendor printers
type: feature
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US73
milestone: "VSS:M5"
sprint: "VSS:SP44"
depends_on: [380, 339, PRF-101]
created: 2026-10-25
---

A command `Add printer (vendor protocol)` shows the adapters with their labels; for a reverse-engineered adapter a modal dialog says what that means (unofficial, may break on a firmware update, LAN mode caveats where the adapter has them) and records the answer, then hands over to the Add printer flow with the host type preselected and the consent version stored in the connection. The adapters themselves refuse to open without that consent version.

**Code:** `vsslicer/modules/apps/printers-unofficial/src/presentation/...` (module: `printers-unofficial-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Declining connects nothing and stores no connection; accepting stores the consent version once per adapter; a changed text version asks again (test with a stubbed dialog)
- [ ] A printer whose connection lacks the consent version fails to open with `refused` and a message pointing to the consent command
- [ ] The Printers view shows the label next to every vendor-protocol printer
- [ ] A command resets consents

## Tasks

- [ ] Command and quick pick
- [ ] Modal dialog
- [ ] Hand-over to Add printer
- [ ] Reset command
- [ ] Tests

## Progress

Not started.
