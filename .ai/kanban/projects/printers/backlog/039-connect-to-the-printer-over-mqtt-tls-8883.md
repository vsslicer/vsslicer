---
id: 39
title: Connect to the printer over MQTT/TLS 8883
type: feature
priority: P1
effort: M
model: opus
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP16"
depends_on: [33, 38]
created: 2026-10-25
---

MQTT client with the Bambu CA bundle, explicit CN check against the serial when connecting by IP, `pushall` request and subscription.

**Code:** `vsslicer/modules/printer-bambu/src/adapters/...` (module: `printer-bambu`, layer: `adapters`)

## Acceptance criteria

- [ ] Connects to the fake broker with the CA; a certificate whose CN is not the serial is rejected even when the IP matches (security test)
- [ ] `pushing.pushall` is sent on connect and on resync; frames flow into the status decoder
- [ ] TLS and parse errors become `PrinterError`, never unhandled rejections

## Tasks

- [ ] TLS config and CN check
- [ ] Subscribe and pushall
- [ ] Tests against the fake broker

## Progress

Not started.
