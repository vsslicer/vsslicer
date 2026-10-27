---
id: 95
title: "Add the Spoolman settings, the private-URL warning and the import command"
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman, ui]
story: US38
milestone: "VSS:M4"
sprint: "VSS:SP36"
depends_on: [63, 94]
created: 2026-10-25
---

Settings: Spoolman URL (no credentials) and sync on or off per instance; a warning when the URL is not private or loopback; the import command with the dry-run summary shown for confirmation.

**Code:** `vsslicer/modules/apps/filament/src/presentation/...` (module: `filament-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Sync is off by default; a public URL shows a warning because Spoolman has no authentication
- [ ] Import shows the dry-run summary and applies only after confirmation (integration test against the recorded Spoolman fixture server)

## Tasks

- [ ] Settings
- [ ] Warning
- [ ] Import command
- [ ] Integration test

## Progress

Not started.
