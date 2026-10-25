---
id: US56
title: "Check the web builds on vscode.dev by hand and ship the web-capable VSIX"
status: reviewed
epic: VSS:E48
---

As a maintainer, I want a recorded manual check on vscode.dev and a release that publishes the web-capable VSIX through the normal release workflow, so that the web build is verified once per release on a real host.

## Acceptance criteria

- [ ] A checklist (with browser and date columns) covers: open a G-code file from a public GitHub repository, scrub layers, read thumbnails, open a 3MF, and on Chrome open a local folder with File System Access
- [ ] The tag-driven release workflow publishes the web-capable VSIX with the `browser` entry and fails by name if the VSIX content assertion fails
- [ ] Verified on fixtures and in Chromium only; no printer is involved

## Out of scope

- Automating the vscode.dev run.
