---
id: US26
title: "A user imports from installed slicers and downloads Prusa vendor bundles"
status: reviewed
epic: VSS:E14
---

A user runs one command to import from the slicers VSSlicer found, or another to download a Prusa vendor bundle after being told the upstream URL and commit.

## Acceptance criteria

- [ ] Import from installed slicer on fixture folders for each OS layout shows an import report with counts and diagnostics; source folders are unchanged (checksum)
- [ ] The download command shows URL and pinned commit, writes only to `globalStorageUri`, and offline gives an error message with a retry action and no partial bundle
- [ ] The fixture workspace passes the PLT fixtures check

## Out of scope

- The add-printer wizard (E17).
