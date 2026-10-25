---
id: 13
title: Filament management
type: spike
priority: P1
effort: M
area: [filament]
milestone: R1
owner: worker-sonnet
created: 2026-10-25
---

Filament databases, spool inventory systems, tag standards and how to measure consumption from printers.

Report: `docs/research/filament-management.md`. Notes: `.reference/notes/VSS-13-filament-management.md`.

## Acceptance criteria

- [ ] Spoolman documented: data model (vendor, filament, spool), REST API, Moonraker integration, client ecosystem; licence
- [ ] Open Filament Database and other databases (SimplyPrint, 3D Filament Profiles, Filament Hub, Bambu filament list) compared: schema, coverage, licence, API
- [ ] Tag standards documented: OpenPrintTag (NFC) spec status, Bambu RFID (RFID-Tag-Guide decoding, encryption, what AMS exposes via MQTT), Creality/other vendor tags
- [ ] Consumption measurement options compared: Moonraker Spoolman integration (filament_used), AMS remain percentage, G-code filament totals from slicer metadata, OctoPrint filament manager plugins; accuracy and failure modes
- [ ] Recommendation: data model for spools in VSSlicer, which DBs we import from, how we track consumption per adapter

## Tasks

- [ ] Read Spoolman API and Moonraker spoolman docs; OFD repo; OpenPrintTag
- [ ] Read RFID-Tag-Guide and ha-bambulab AMS fields
- [ ] Write the report

## Progress

Not started.
