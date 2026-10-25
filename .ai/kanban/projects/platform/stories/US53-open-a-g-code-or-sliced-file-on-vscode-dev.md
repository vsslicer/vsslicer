---
id: US53
title: "Open a G-code or sliced file on vscode.dev"
status: reviewed
epic: VSS:E48
---

As someone who shares print files in a repository, I want the G-code preview to work on vscode.dev and github.dev, so that I can open a `.gcode`, `.bgcode` or `.gcode.3mf` from a repository or a local folder without a desktop install.

## Acceptance criteria

- [ ] `vsslicer.gcode` has a `browser` entry and activates in the web extension host; it opens the corpus files through `vscode.workspace.fs` only, scrubs layers and shows thumbnails
- [ ] A file above the stated web size limit shows the stated message and opens nothing; a file below it opens within the stated time on the CI runner
- [ ] The `@vscode/test-web` tests of the preview run in CI on every pull request that touches its browser path

## Out of scope

- Live follow, printers, simulation timing that needs the daemon.
