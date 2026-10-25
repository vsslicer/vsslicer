---
id: 90
title: Read Orca user machine presets as printer instances
type: feature
priority: P0
effort: M
model: opus
area: [importers, store]
story: US36
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [29, 139, 136]
created: 2026-10-25
---

Orca keeps connection fields in different places than PrusaSlicer (unverified); a first step on fixtures settles where, then the reader builds instances.

**Code:** `vsslicer/modules/profiles-orca/src/adapters/instances/` (module: `profiles-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] A note in the card's Progress records where Orca stores host and credential, from fixtures saved by the real app (version recorded)
- [ ] Fixture Orca machine presets yield instances keeping model, nozzle and host
- [ ] Credentials are returned separately from the entity; unknown host types give a diagnostic

## Tasks

- [ ] Inspect real fixtures
- [ ] Write the reader
- [ ] Tests

## Progress

Not started.
