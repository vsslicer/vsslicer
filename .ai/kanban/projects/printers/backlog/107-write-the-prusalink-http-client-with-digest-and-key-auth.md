---
id: 107
title: Write the PrusaLink HTTP client with Digest and key auth
type: feature
priority: P0
effort: M
model: opus
area: [prusalink]
story: US21
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [106, 105]
created: 2026-10-25
---

HTTP client with Digest auth and `X-Api-Key` fallback, polling and timeouts.

**Code:** `vsslicer/modules/printer/prusalink/src/adapters/...` (module: `printer-prusalink`, layer: `adapters`)

## Acceptance criteria

- [ ] Digest challenge-response against the recorded 401; fallback to `X-Api-Key` when the printer offers it; wrong credentials give `PrinterError.auth`
- [ ] Status polling interval backs off when idle

## Tasks

- [ ] Digest implementation
- [ ] Key fallback
- [ ] Polling and tests

## Progress

Not started.
