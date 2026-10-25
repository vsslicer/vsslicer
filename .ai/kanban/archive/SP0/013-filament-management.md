---
id: 13
title: Filament management
type: spike
priority: P1
effort: M
area: [filament]
milestone: R1
sprint: SP0
owner: worker-sonnet
created: 2026-10-25
---

Filament databases, spool inventory systems, tag standards and how to measure consumption from printers.

Report: `docs/research/filament-management.md`. Notes: `.reference/notes/VSS-13-filament-management.md`.

## Acceptance criteria

- [x] Spoolman documented: data model (vendor, filament, spool), REST API, Moonraker integration, client ecosystem; licence
- [x] Open Filament Database and other databases (SimplyPrint, 3D Filament Profiles, Filament Hub, Bambu filament list) compared: schema, coverage, licence, API
- [x] Tag standards documented: OpenPrintTag (NFC) spec status, Bambu RFID (RFID-Tag-Guide decoding, encryption, what AMS exposes via MQTT), Creality/other vendor tags
- [x] Consumption measurement options compared: Moonraker Spoolman integration (filament_used), AMS remain percentage, G-code filament totals from slicer metadata, OctoPrint filament manager plugins; accuracy and failure modes
- [x] Recommendation: data model for spools in VSSlicer, which DBs we import from, how we track consumption per adapter

## Tasks

- [x] Read Spoolman API and Moonraker spoolman docs; OFD repo; OpenPrintTag
- [x] Read RFID-Tag-Guide and ha-bambulab AMS fields
- [x] Write the report

## Progress

Done. Report `docs/research/filament-management.md` covers Spoolman (model, API, Moonraker integration, licence), the filament databases compared, tag standards (OpenPrintTag, Bambu RFID, others), consumption measurement options with accuracy and failure modes, and the recommended spool data model. Clones: Spoolman, OpenFilamentDatabase, OpenPrintTag, RFID-Tag-Guide. Reviewed (`.ai/local/reviews/VSS-13.md`): all criteria met, 10+ citations and 5 URLs checked, licence statements match LICENSE files; RFID-Tag-Guide has no licence and ships a Bambu master key, so the report advises against embedding it. Open: "Filament Hub" unidentified; 3D Filament Profiles status is a SimplyPrint claim (unverified).
