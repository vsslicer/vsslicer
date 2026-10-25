---
id: 40
title: Reconnect with backoff and map connection errors
type: feature
priority: P1
effort: S
model: sonnet
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [39]
created: 2026-10-25
---

Reconnect loop with exponential backoff capped at 60 s; a wrong access code stops retrying.

**Code:** `vsslicer/modules/printer-bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Fake-clock test: backoff grows to the 60 s cap and resets after a success; a wrong access code gives `PrinterError.auth` and does not spin
- [ ] Disconnect fixture from the fake broker reaches `offline` status and recovers

## Tasks

- [ ] Backoff
- [ ] Error mapping
- [ ] Fake-clock tests

## Progress

Not started.
