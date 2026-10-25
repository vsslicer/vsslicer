---
id: US15
title: "Get CuraEngine on my machine"
status: reviewed
epic: VSS:E28
---

As a user, I want VSSlicer to find or fetch CuraEngine from the pinned Cura release, so that I can slice with Cura profiles without running Cura.

## Acceptance criteria

- [ ] CuraEngine is detected in an installed Cura or at `vsslicer.slicer.cura.path`, with its version
- [ ] The pinned Cura release is downloaded after confirmation, checksum-verified (US2 rules), and CuraEngine is extracted from the AppImage, DMG or installer on each platform
- [ ] macOS quarantine findings from the Orca spike are applied
- [ ] Extraction per platform runs as its own CI step

## Out of scope

- A standalone CuraEngine release (none exists)
