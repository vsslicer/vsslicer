---
id: 94
title: "Spike: run OctoPrint's virtual printer in CI"
type: spike
priority: P0
effort: S
model: opus
area: [octoprint]
story: US24
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [PLT-9]
created: 2026-10-25
---

One-day spike: OctoPrint in Docker with the virtual printer plugin on a free CI runner.

**Code:** `vsslicer/modules/printer-octoprint/test/` (module: `printer-octoprint`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] A note records the image, startup time, CI minutes and whether upload, start, pause and cancel work; decision to run it in CI or fall back to fixtures

## Tasks

- [ ] Run OctoPrint in Docker
- [ ] Drive the REST API
- [ ] Write the note

## Progress

Not started.
