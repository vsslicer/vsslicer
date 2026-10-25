---
id: 109
title: Probe the firmware version and fall back to legacy endpoints
type: feature
priority: P0
effort: S
model: sonnet
area: [prusalink]
story: US21
milestone: "VSS:M3"
depends_on: [107]
created: 2026-10-25
---

`/api/version` probe; legacy `api/files` upload and status when v1 is missing.

**Code:** `vsslicer/modules/printer-prusalink/src/adapters/...` (module: `printer-prusalink`, layer: `adapters`)

## Acceptance criteria

- [ ] A legacy fixture uploads through `api/files`; an unknown version is logged with the response and falls back

## Tasks

- [ ] Probe
- [ ] Legacy upload
- [ ] Tests

## Progress

Not started.
