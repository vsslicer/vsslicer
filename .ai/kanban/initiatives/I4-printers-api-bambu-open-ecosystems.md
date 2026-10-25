---
id: I4
title: Printers: generic API, Bambu first, open ecosystems, daemon and export to storage
status: approved
milestone: M3
order: 4
projects: PRN
phases: 4, and the Bambu part of 7
---

## Problem

The owner's printer is a Bambu H2C and the roadmap put Bambu control months away behind the open ecosystems. Sending a file, watching a print and controlling a job are the first things a user does after previewing.

## Outcome

`@vsslicer/printer-api` (adapter, session, discovery, camera source, capability flags) designed first (D3). `vsslicer.bambu` on an open-source Bambu networking implementation: Developer Mode LAN (MQTT/TLS, FTPS, `.gcode.3mf` send, AMS mapping, HMS notifications), read-only mode, capability table per model and firmware starting with the H2C. Then `vsslicer.printers` with Moonraker, OctoPrint, PrusaLink and Duet, mDNS/SSDP discovery, the `printer://` FileSystemProvider, export to removable media (FAT 8.3 names), a background upload queue, live follow by file offset in the I1 preview, and the `vsslicer-agent` daemon holding sessions across windows.

## Roadmap phases and feature-matrix rows

Roadmap phase(s) 4, and the Bambu part of 7 (`.ai/plans/roadmap.md`). Rows (`docs/research/feature-matrix.md`): §11 all rows except Vendor protocols, USB serial and Firmware flashing (I10) and Wi-Fi config writer and Prusa Connect (P3); §5 AMS slot mapping at send; §15 Background upload queue; §10 Live print follow (the feed); §12 none (cameras are I7).

## Exit criteria

- A sliced `.gcode.3mf` reaches the H2C over LAN, prints, and its status, progress and HMS events show in VS Code; verified on the H2C with the firmware version recorded
- Adapter contract tests pass against recorded fixtures for Bambu (ha-bambulab mock data and a fake broker), Moonraker, OctoPrint, PrusaLink and Duet; OctoPrint's virtual printer runs in CI if feasible, otherwise fixtures only
- Daemon survives a window reload, serves two windows on one session, and shuts down within the 5 s `deactivate` budget
- Export to a folder or drive sanitises names (property tests) and the preview follows a live print by file offset

## Order: 4 of 11

Fourth because the API design needs the hardest adapter (Bambu) in view and the owner can only verify on an H2C (D5); the open ecosystems prove the API is generic. Depends on I1 (live follow) and I2 (`.gcode.3mf`). Printing an existing file is useful before slicing exists.

Order rationale follows the roadmap's rule: testability first (libraries checked against deterministic fixtures and external oracles), usability next (daily workflows on proven foundations), functionality last (breadth, optional engines, the fork).
