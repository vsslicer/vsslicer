---
id: US28
title: "A user lists, downloads, uploads and deletes printer files in the Explorer"
status: reviewed
epic: VSS:E24
---

As a printer owner, I want `printer://<name>/` mounted in the Explorer, so that I handle files on the printer the VS Code way.

## Acceptance criteria

- [ ] FileSystemProvider tests with the fake adapter and the E23 fixtures: `readDirectory`, `stat`, `readFile`, `writeFile`, `delete`, `rename` where the adapter supports move; file-change events after upload and delete
- [ ] Bambu storage through FTPS, Moonraker `gcodes`, OctoPrint `local`/`sdcard`, PrusaLink storages and Duet `0:/gcodes` each implement the file capabilities
- [ ] The provider registers only when at least one printer exists; a setting disables it
- [ ] On the H2C (firmware recorded): list the SD card over FTPS, download and open a `.gcode.3mf`, upload and delete a file
- [ ] Remote-SSH: `printer://` works from a remote workspace because the provider is in the UI-kind extension (manual check)

## Out of scope

- SMB mounting, FlashAir and MKS uploads, timelapse folders.
