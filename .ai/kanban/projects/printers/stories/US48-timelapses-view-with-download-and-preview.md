---
id: US48
title: "Timelapses view with download and preview"
status: reviewed
epic: VSS:E39
---

As a user, I want a Timelapses view per printer where I can list, download and open timelapses, so that I can review a print's video from VS Code.

## Acceptance criteria

- [ ] The view lists name, date, size, state and a thumbnail where the provider has one; unrendered sets can be rendered
- [ ] Download to the workspace or a folder uses E24's download path with progress and cancel; no partial file is left
- [ ] Open uses VS Code's media preview
- [ ] On the H2C (firmware recorded): one timelapse listed, downloaded and played in VS Code, container recorded

## Out of scope

- Attaching a timelapse to a history record (E46)
