---
id: 43
title: Upload over FTPS implicit TLS 990
type: feature
priority: P1
effort: M
model: opus
area: [bambu]
story: US10
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [42, 14]
created: 2026-10-25
---

The upload client: stream with progress, abort, typed errors.

**Code:** `vsslicer/modules/printer-bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Against the local FTPS server: progress events, abort (server sees the connection closed), resume refused, wrong access code gives `PrinterError.auth`
- [ ] Certificate handling matches the MQTT card (CA bundle, explicit CN check)

## Tasks

- [ ] FTPS client wrapper
- [ ] Progress and abort
- [ ] Tests

## Progress

Not started.
