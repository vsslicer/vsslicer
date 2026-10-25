---
id: E24
title: Export to storage and browse printer files through printer://
status: reviewed
initiative: I4
project: PRN
order: 5
depends_on: [E20, E21, E23]
rows: ["§11 Export to removable media or a shared folder", "§11 Browse files on the printer"]
---

Delivers the two file-system surfaces of printing: "Export to drive or folder" for printers without a
network (SD card, USB stick, a shared folder), with names the target firmware can read, and a
`printer://<name>/` FileSystemProvider that mounts a connected printer's storage in the Explorer so
users list, open, upload, rename and delete files the VS Code way. Both are in `vsslicer.printers`.

## Scope

In:
- Export to storage: a command and a `PrinterAdapter` with only `upload` for a "folder or drive"
  printer type; name sanitisation (FAT 8.3 default, long names when the printer connection sets
  `longFilenames`; ASCII fold, reserved names, collisions, extension kept); removable-volume listing
  per OS where cheap (macOS `/Volumes`, Linux `/media` and `/run/media`, Windows drive letters) plus
  any folder; safe-write (temp file then rename, `fsync`) and an "eject the card" hint.
- `printer://` FileSystemProvider over `Session.files`, `upload`, `deleteFile`, `fileMetadata`:
  `readDirectory`, `stat`, `readFile` (download, size limit with a prompt), `writeFile` (upload),
  `delete`, `rename` where the adapter supports move; read-only when the adapter lacks write
  capabilities; thumbnails surfaced through `fileMetadata` in a hover or a custom view.
- Opening a `printer://` G-code file opens the `vsslicer.gcode` preview (E5) via its URI.
- Bambu storage through FTPS (E21's client), Moonraker `gcodes` root, OctoPrint `local`/`sdcard`,
  PrusaLink storages, Duet `0:/gcodes`.

Out: Marlin `M115` long-filename detection (needs serial, E59), SD over serial (E59), SMB
mounting (user-side), FlashAir and MKS Wi-Fi uploads (could be thin adapters later in E60),
timelapse folders (E39).

## Feature-matrix rows

- §11 Export to removable media or a shared folder (P0): done when a sliced file exported to a FAT32
  card with default settings is readable by name on a Marlin-style 8.3 firmware (property tests plus
  a FAT image test), and export to any folder works.
- §11 Browse files on the printer (P1): done when the H2C, Moonraker and OctoPrint fixtures list,
  download, upload and delete through `printer://` in the Explorer.

## Acceptance criteria

- [ ] Property tests (fast-check) for name sanitisation: output always 8.3-valid in FAT mode,
      idempotent, collision-free in a directory, extension preserved, no reserved device names
- [ ] FAT32 image test: export into a mounted loopback FAT image (Linux CI) and read the directory
      back; long names off produce 8.3 entries only
- [ ] Safe-write test: an aborted export leaves no partial file under the final name
- [ ] FileSystemProvider tests with the fake adapter and the E23 fixtures: each operation, read-only
      mode, permission errors as `FileSystemError.NoPermissions`, unreachable printer as
      `Unavailable`, file-change events after upload and delete
- [ ] On the H2C (firmware recorded): list the SD card over FTPS, download and open a `.gcode.3mf`,
      upload and delete a file
- [ ] Opening a `printer://` G-code file opens the preview (integration test with E5's editor)
- [ ] Remote-SSH: `printer://` works from a remote workspace because the provider is in the UI-kind
      extension (manual check)
- Volume listing per OS is a manual checklist on macOS, Windows and Linux.

## Dependencies

- Needs E20 (API), E21 (Bambu FTPS), E23 (open adapters' file APIs); E5 to open files in
  the preview (optional at runtime: without it, files open as text).
- Exposes the "folder or drive" adapter and `printer://` URIs to E25 (queued exports), SLC (export
  after slicing), E47 (dispatch to SD-only printers), E39 (timelapse download reuses the
  download path).

## Risks and spikes

- OS volume detection and eject APIs are unresearched (`printer-connectivity.md` §4): the epic lists
  mount roots and leaves ejecting to the OS; a story may add eject if a cheap API exists.
- Name limits for Duet and PrusaLink are undocumented: those adapters accept long names; failures
  from the printer surface as `fileRejected` with the name.
- Large downloads through `readFile` buffer in memory: cap with a prompt and offer "download to
  folder" streaming instead.

## Eng review

- Scope challenge: export and `printer://` merged because both are thin file surfaces over the same
  `Session` calls and share sanitisation; together about three sprints.
- Edge cases over speed: collisions, reserved names, partial writes and read-only adapters each have
  a test.
- Blast radius: a hung printer in the Explorer can stall file operations; every provider call has a
  timeout and returns `Unavailable`.
- Reversibility: the provider registers only when at least one printer exists; a setting disables it.
