---
id: 9
title: "Printer connectivity: open ecosystems"
type: spike
priority: P0
effort: L
area: [printers]
milestone: R1
sprint: SP0
owner: worker-sonnet
created: 2026-10-25
---

The APIs for talking to printers we can support without vendor secrets, and the export-to-storage fallback.

Report: `docs/research/printer-connectivity.md`. Notes: `.reference/notes/VSS-9-printer-connectivity-open.md`.

## Acceptance criteria

- [x] Per ecosystem, the API documented (transport, auth, discovery, upload/start/pause/cancel, status/telemetry, file listing, webcam): Moonraker/Klipper, OctoPrint, PrusaLink and Prusa Connect, Duet RepRapFirmware, Repetier-Server
- [x] Vendor Klipper derivatives: Creality K1/K2 (root/Moonraker access, Creality Cloud), Elegoo SDCP (Centauri Carbon and resin), Anycubic (Kobra/Photon, Rinkhals), Snapmaker (SACP/HTTP, Snapmaker Orca), AnkerMake (MQTT, ankermake-m5-protocol); what is official vs reverse engineered and firmware versions
- [x] USB/serial direct printing: Marlin serial protocol, feasibility from Node (serialport native module) and its limits
- [x] Export to storage: SD/USB conventions, network shares, printer-side FTP/HTTP uploads; what each firmware expects (file name limits, metadata)
- [x] Discovery: mDNS/Bonjour, SSDP, vendor broadcast protocols
- [x] A unified printer-adapter interface proposal with capability flags, derived from the comparison; licence notes for any library we might reuse

## Tasks

- [x] Read Moonraker, OctoPrint, PrusaLink, RRF docs; clone where code is the source of truth
- [x] Survey community reverse-engineering repos for vendor firmware
- [x] Write the report

## Progress

Done. Moonraker, OctoPrint, PrusaLink/Connect, Duet RRF/DSF and Repetier APIs; vendor Klipper derivatives and resin/other vendors (Creality, Elegoo SDCP, Anycubic incl. Photon, Snapmaker SACP, AnkerMake) with a per-finding firmware/version table and official-vs-reverse-engineered status; serial/Marlin; export to storage with file-name limits, SMB/FTP and per-firmware metadata; discovery; unified adapter interface with capability matrix. Reviewed by a reviewer worker (`.ai/local/reviews/VSS-{n}.md`); fixes requested were applied and re-verified (`.ai/local/reviews/fix-verification.md`). Open: Creality Cloud has no public spec; Duet/PrusaLink name-length limits and OS volume detection unsourced.
