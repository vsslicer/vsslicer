---
id: US27
title: "A user picks a removable volume and an aborted export leaves nothing half written"
status: reviewed
epic: VSS:E24
---

As a user, I want the volume list to show my SD card or USB stick and the write to be safe, so that I can eject the card without a corrupt file.

## Acceptance criteria

- [ ] Safe-write test: an aborted export leaves no partial file under the final name (temp file then rename, `fsync`)
- [ ] Removable volumes are listed on macOS (`/Volumes`), Linux (`/media`, `/run/media`) and Windows (drive letters) plus any folder; per-OS listing is a manual checklist
- [ ] After export an 'eject the card' hint is shown; ejecting is left to the OS

## Out of scope

- Programmatic eject.
