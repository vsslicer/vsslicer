---
id: 426
title: Perform the LAN handshake and keep keys out of files
type: feature
priority: P2
effort: M
model: opus
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [425]
created: 2026-10-25
---

Runs the HTTP handshake on port 18910, validates what it returns, and hands the device certificate and keys to the secret store port; they are never written to settings, workspace files or logs.

**Code:** `vsslicer/modules/printer-unofficial-anycubic/src/adapters/...` (module: `printer-unofficial-anycubic`, layer: `adapters`)

## Acceptance criteria

- [ ] Against a fake server the handshake yields credentials that are held by the secret port only; a grep of captured logs and written files finds none of the key bytes
- [ ] A handshake failure maps to `auth` or `unreachable`; the TLS peer certificate is pinned to the one returned
- [ ] Security review notes in the module README

## Tasks

- [ ] Handshake client
- [ ] Secret port use
- [ ] Pinning
- [ ] Tests

## Progress

Not started.
