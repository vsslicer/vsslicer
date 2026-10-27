---
id: 150
title: Add VSSlicer icons and a check for Microsoft marks
type: chore
priority: P2
effort: S
model: sonnet
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [127]
created: 2026-10-25
---

Product icons for each platform (original artwork) and a scan of the build output for Microsoft marks, icons and Microsoft-licensed extensions (`licensing.md` section 2 (d), (g)).

**Code:** `vsslicer/modules/tooling/vsslicer-build/src/adapters/ms-marks-scan.ts` (module: `vsslicer-build`, layer: `adapters`)

## Acceptance criteria

- [ ] Icon set exists for linux, macOS (icns) and Windows (ico) with a provenance note
- [ ] The scan fails on a fixture tree containing a Microsoft mark string, the marketplace URL and a `ms-vscode` extension id, and passes on our output
- [ ] The scan runs on the build output in CI

## Tasks

- [ ] Add the icons
- [ ] Write the scan and its fixtures

## Progress

Not started.
