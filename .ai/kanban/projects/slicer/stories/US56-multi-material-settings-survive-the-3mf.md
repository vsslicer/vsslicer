---
id: US56
title: "Multi-material settings survive the plate 3MF"
status: reviewed
epic: VSS:E63
---

As a user, I want tower, purge, flush and nozzle map settings stored in the plate 3MF, so that reopening a project shows what I set.

## Acceptance criteria

- [ ] Tower, flush matrix, purge targets, feature assignment and nozzle map round trip through the plate 3MF without loss (`@vsslicer/3mf`)
- [ ] The panel tests run in the webview harness for each section
- [ ] Disabling the panel returns to the imported values

## Out of scope

