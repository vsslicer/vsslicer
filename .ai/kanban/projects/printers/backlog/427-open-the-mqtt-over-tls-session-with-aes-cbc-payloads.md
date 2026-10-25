---
id: 427
title: Open the MQTT-over-TLS session with AES-CBC payloads
type: feature
priority: P2
effort: L
model: opus
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP32"
depends_on: [426]
created: 2026-10-25
---

Mutual-TLS MQTT client on port 9883 using the `mqtt` package (MIT), subscribing to the printer's topics, decrypting and encrypting payloads, with reconnect and read-only fallback.

**Code:** `vsslicer/modules/printer-unofficial-anycubic/src/adapters/...` (module: `printer-unofficial-anycubic`, layer: `adapters`)

## Acceptance criteria

- [ ] Against a local TLS MQTT broker with test certificates, status messages decrypt to the fixtures and a control message encrypts to the expected bytes
- [ ] A broker that rejects the certificate maps to `auth`; a dropped connection reconnects
- [ ] Nothing connects to a vendor cloud host (test asserts the only hosts contacted are the printer)

## Tasks

- [ ] MQTT client
- [ ] Cipher
- [ ] Reconnect
- [ ] Tests

## Progress

Not started.
