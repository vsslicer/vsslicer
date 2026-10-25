---
id: E61
title: "Deferred P3 rows: firmware flashing, Prusa Wi-Fi config, Prusa Connect, printer-side calibration, cloud fleet"
status: draft
initiative: I10
project: PRN
order: 13
depends_on: []
rows: ["§11 Firmware flashing and updates", "§11 Wi-Fi config writer for Prusa printers", "§11 Prusa Connect (cloud)", "§6 Printer-side automatic calibration (PA tables over MQTT)", "§15 Cloud fleet services (Prusa Connect, Digital Factory)"]
---

Holds the PRN feature-matrix rows that are P3 (niche, deferred or skipped). None is scheduled; each
waits for an owner decision.

## Scope

Nothing is built in this epic. Each row below names why it waits.

## Feature-matrix rows

- §11 Firmware flashing and updates (P3): risky and rare; a failed flash can brick a board, and the
  only test hardware is a Bambu H2C whose firmware updates go through Bambu (D5). Would live in
  `vsslicer.printers-serial` (avrdude/STM32 bootloaders) if ever.
- §11 Wi-Fi config writer for Prusa printers (P3): niche SuperSlicer feature; writing a
  `prusa_printer_settings.ini` to a USB stick is a small story if requested.
- §11 Prusa Connect (cloud) (P3): the cloud API is mostly not public; PrusaLink covers the LAN.
- §6 Printer-side automatic calibration (PA tables over MQTT) (P3): depends on Bambu firmware access
  (`extrusion_cali_*` commands); under authorization firmware these need signing, and only
  Developer Mode might allow them. Revisit after E21's spike and H2C capability table.
- §15 Cloud fleet services (Prusa Connect, Digital Factory) (P3): proprietary hosted APIs with plan
  gates; VSSlicer's local fleet queue (E47) is the product answer.

## Acceptance criteria

- [ ] An owner decision reopens a row.

## Dependencies

None until a row is reopened.

## Risks and spikes

None while deferred.

## Eng review

Deferred rows are listed so every PRN row has a home; no work is planned.
