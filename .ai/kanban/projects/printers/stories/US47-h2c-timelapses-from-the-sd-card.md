---
id: US47
title: "H2C timelapses from the SD card"
status: reviewed
epic: VSS:E39
---

As the owner of a Bambu H2C, I want my timelapses listed and downloaded from the printer's SD card over FTPS, so that I can get the videos without removing the card.

## Acceptance criteria

- [ ] The H2C timelapse folder and container (MP4 or AVI, index-less or not) are found and recorded in `docs/`
- [ ] A per-model capability table records folder and container; unverified models are flagged
- [ ] The Bambu provider lists and downloads with progress and cancel through the FTPS file operations
- [ ] An unplayable file downloads with a note

## Out of scope

- Bambu cloud timelapses
