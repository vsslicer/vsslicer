---
id: US72
title: "Slice with nothing installed"
status: reviewed
epic: VSS:E66
---

As a new user or a user on a locked-down machine, I want slicing to work with no slicer installed, so that I can start immediately.

## Acceptance criteria

- [ ] With no engine installed, `vsslicer.slicer.embeddedEngine` lets the extension fall back to the embedded engine and say so
- [ ] The chosen engine passes the I5 layer-count and estimate checks on its fixtures
- [ ] The embedded engine reuses the Cura settings resolution unchanged

## Out of scope

