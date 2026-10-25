---
id: 248
title: "Load camera sources by module path and give them the session's secrets"
type: feature
priority: P1
effort: M
model: sonnet
area: [camera, daemon]
story: US41
milestone: "VSS:M4"
sprint: "VSS:SP28"
depends_on: [247]
created: 2026-10-25
---

Camera sources are loaded the way adapters are (PRN-64): by module path from a registered descriptor, with the printer's connection and secrets from agent memory only.

**Code:** `vsslicer/modules/printer-agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] A source registered through `camera.registerSources` is loaded once and shared by windows; secrets reach it in memory only (log test shows none written)
- [ ] A source module that throws on load is reported as an error for that printer only; other cameras keep working
- [ ] A stuck camera cannot block printer status (separate timeouts; test with a hung source)

## Tasks

- [ ] Write the camera loader
- [ ] Pass connection and secrets
- [ ] Test failure isolation

## Progress

Not started.
