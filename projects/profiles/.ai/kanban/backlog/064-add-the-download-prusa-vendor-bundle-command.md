---
id: 64
title: "Add the 'Download Prusa vendor bundle' command"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US26
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [59, 137]
created: 2026-10-25
---

States the upstream URL and pinned commit before fetching (D4), writes only to `globalStorageUri`, and handles offline.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/commands/download/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] The confirmation message shows URL and commit; declining writes nothing
- [ ] Offline: an error message with a Retry action; no partial bundle remains on disk
- [ ] Files land only under `globalStorageUri`

## Tasks

- [ ] Write the command
- [ ] Offline test with a stubbed network
- [ ] Integration test

## Progress

Not started.
