---
id: 9
title: Printer connectivity: open ecosystems
type: spike
priority: P0
effort: L
area: [printers]
milestone: R1
owner: worker-sonnet
created: 2026-10-25
---

The APIs for talking to printers we can support without vendor secrets, and the export-to-storage fallback.

Report: `docs/research/printer-connectivity.md`. Notes: `.reference/notes/VSS-9-printer-connectivity-open.md`.

## Acceptance criteria

- [ ] Per ecosystem, the API documented (transport, auth, discovery, upload/start/pause/cancel, status/telemetry, file listing, webcam): Moonraker/Klipper, OctoPrint, PrusaLink and Prusa Connect, Duet RepRapFirmware, Repetier-Server
- [ ] Vendor Klipper derivatives: Creality K1/K2 (root/Moonraker access, Creality Cloud), Elegoo SDCP (Centauri Carbon and resin), Anycubic (Kobra/Photon, Rinkhals), Snapmaker (SACP/HTTP, Snapmaker Orca), AnkerMake (MQTT, ankermake-m5-protocol); what is official vs reverse engineered and firmware versions
- [ ] USB/serial direct printing: Marlin serial protocol, feasibility from Node (serialport native module) and its limits
- [ ] Export to storage: SD/USB conventions, network shares, printer-side FTP/HTTP uploads; what each firmware expects (file name limits, metadata)
- [ ] Discovery: mDNS/Bonjour, SSDP, vendor broadcast protocols
- [ ] A unified printer-adapter interface proposal with capability flags, derived from the comparison; licence notes for any library we might reuse

## Tasks

- [ ] Read Moonraker, OctoPrint, PrusaLink, RRF docs; clone where code is the source of truth
- [ ] Survey community reverse-engineering repos for vendor firmware
- [ ] Write the report

## Progress

Not started.
