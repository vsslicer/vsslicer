---
id: US50
title: "Build a module for the browser and fail the build on Node imports"
status: reviewed
epic: VSS:E48
---

As a module author, I want a browser build target and a check that fails when anything reachable from a browser entry imports a Node built-in, so that a desktop-only import cannot break activation on vscode.dev unnoticed.

## Acceptance criteria

- [ ] The tooling module builds a module's `browser` entry with esbuild `platform: browser` as a web-extension-host bundle, and the existing `main` build is unchanged
- [ ] A check fails when a module reachable from a browser entry imports a Node built-in (`fs`, `worker_threads`, `child_process`, `net` and the rest of the built-in list, with or without `node:`); a fixture module importing `fs` proves it fails
- [ ] The VSIX content assertion checks that the `browser` entry exists, the browser bundle passes the check and the size budget holds
- [ ] `gcode-parser`, `gcode-bgcode`, `3mf`, `mesh` and the `webview-kit` host entry pass the check on their browser paths

## Out of scope

- Web builds of the slicer, engines, printers, cameras and the daemon; editing in `vsslicer.project` on the web.
