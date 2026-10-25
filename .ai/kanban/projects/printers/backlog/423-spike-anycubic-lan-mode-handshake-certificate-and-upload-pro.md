---
id: 423
title: "Spike: Anycubic LAN-mode handshake, certificate and upload procedure"
type: spike
priority: P2
effort: L
model: opus
area: [unofficial]
story: US71
milestone: "VSS:M5"
sprint: "VSS:SP45"
depends_on: [422]
created: 2026-10-25
---

Settles from the sources the research cites (kobra-connect, Apache-2.0; the Anycubic LAN connection guide) how the LAN mode works: the HTTP handshake on port 18910 that yields the device certificate, mutual TLS on port 9883, AES-CBC payloads, topics under `anycubic/anycubicCloud/v1/{model_id}/{device_id}`, and whether a file upload is possible at all (the research found no upload procedure).

**Code:** `vsslicer/modules/printer-unofficial-anycubic/docs/lan-mode.md` (module: `printer-unofficial-anycubic`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A document gives each step with the source and what is unverified; it ends with a decision per capability: status, job control, upload (possible, or not offered)
- [ ] It says which stock firmware ranges are known (none published) and that Rinkhals printers run Moonraker instead
- [ ] It records that enabling LAN mode disconnects the vendor cloud, for the consent text
- [ ] Written to `vsslicer/modules/printer-unofficial-anycubic/docs/lan-mode.md`

## Tasks

- [ ] Read the sources
- [ ] Write the document and decisions

## Progress

Not started.
