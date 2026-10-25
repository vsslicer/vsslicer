---
id: 424
title: Record Anycubic LAN sessions as fixtures
type: chore
priority: P2
effort: M
model: sonnet
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [423]
created: 2026-10-25
---

Protocol exchanges for the adapter's tests, derived from the spike document and kobra-connect's published message formats: handshake responses, MQTT topics with encrypted payloads (test keys only), status and control messages, because no such printer is available (D5).

**Code:** `vsslicer/modules/printer-unofficial-anycubic/test/fixtures/` (module: `printer-unofficial-anycubic`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] PROVENANCE.md states for each session whether it was recorded from a device or derived from the cited source, and which firmware it applies to or that none is stated
- [ ] No vendor code is copied; anything ported under D2 carries its notice and a `Ported from` line
- [ ] The fixtures check (size cap and PROVENANCE) passes

## Tasks

- [ ] Derive or record the sessions
- [ ] PROVENANCE
- [ ] Run the fixtures check

## Progress

Not started.
