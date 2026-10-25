---
id: 97
title: Map OctoPrint state and job data to PrinterStatus
type: feature
priority: P0
effort: S
model: sonnet
area: [octoprint]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [95, 14]
created: 2026-10-25
---

State flags, temperatures and job progress into the normalised status.

**Code:** `vsslicer/modules/printer-octoprint/src/domain/...` (module: `printer-octoprint`, layer: `domain`)

## Acceptance criteria

- [ ] Fixture snapshots map correctly; flag combinations (printing+paused, error, closed) follow the printer-api table

## Tasks

- [ ] Mapper
- [ ] Tests

## Progress

Not started.
