---
id: US65
title: "Install vsslicer.printers-serial for my platform and keep serial prints alive across window reloads"
status: reviewed
epic: VSS:E59
---

As a user, I want an optional extension that ships the native serial module for my operating system and keeps the print running in the agent when I reload the window, so that the rest of VSSlicer stays universal and a reload never aborts a print.

## Acceptance criteria

- [ ] Platform VSIXs build in CI for every target the `serialport` prebuilds cover; the CI matrix result and the uncovered targets (armhf) are recorded
- [ ] The extension registers the serial adapter with `vsslicer.printers`; the serial session runs in the agent on the UI machine
- [ ] A print to the emulator survives a window reload (integration test with the agent)
- [ ] Without the extension the adapter is reported as not installed and nothing native loads

## Out of scope

- Web Serial; hosts that cannot see local USB (they get the message from US64).
