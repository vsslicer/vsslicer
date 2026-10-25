---
id: US15
title: "A finished Bambu job books used grams per AMS spool and records remain"
status: reviewed
epic: VSS:E42
---

As a Bambu owner, I want the job's `used_g` per filament mapped through the AMS mapping recorded at send and booked to the spools in those trays, with AMS `remain` kept as a cross-check, so that grams are booked without me.

## Acceptance criteria

- [ ] `slice_info.config` `used_g` per filament, mapped through the recorded AMS mapping, books to the right spools on fixtures
- [ ] `remain`, `remain_g`, `tag_uid` and `tray_uuid` per tray are stored as observations and compared, not booked
- [ ] A job started outside VSSlicer falls back to observations and a manual-entry prompt

## Out of scope

- Auto-creating spools from tray data (E44)
