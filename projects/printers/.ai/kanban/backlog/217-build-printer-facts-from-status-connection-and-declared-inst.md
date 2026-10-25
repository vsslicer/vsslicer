---
id: 217
title: "Build printer facts from status, connection and declared instance"
type: feature
priority: P2
effort: M
model: sonnet
area: [daemon, fleet]
story: US56
milestone: "VSS:M4"
depends_on: [216, 208, 14]
created: 2026-10-25
---

Combine model and nozzles declared by the window (from the `printer_instance`) with live status (nozzle, loaded trays); live values win.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] Fixture H2C status gives nozzle and tray materials; declared values fill gaps; conflicts prefer live and are reported
- [ ] Facts for an offline printer are marked stale

## Tasks

- [ ] Merge
- [ ] Tests

## Progress

Not started.
