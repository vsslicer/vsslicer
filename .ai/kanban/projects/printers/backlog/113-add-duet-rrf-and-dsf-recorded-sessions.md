---
id: 113
title: Add Duet RRF and DSF recorded sessions
type: chore
priority: P0
effort: M
model: sonnet
area: [duet]
story: US22
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [112, PLT-13, 84]
created: 2026-10-25
---

Recordings for `rr_connect`, `rr_model`, `rr_upload` with crc32, session expiry, and DSF `/machine/*` plus WebSocket patches.

**Code:** `vsslicer/modules/printer-duet/test/fixtures/` (module: `printer-duet`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] Sessions replay in the harness; PROVENANCE states they are derived from the published docs (no Duet code copied)

## Tasks

- [ ] Derive sessions
- [ ] PROVENANCE

## Progress

Not started.
