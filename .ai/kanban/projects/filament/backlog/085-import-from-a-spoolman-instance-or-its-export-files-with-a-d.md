---
id: 85
title: Import from a Spoolman instance or its export files with a dry run
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman]
story: US34
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [83, 81, 62]
created: 2026-10-25
---

One-shot import using the `filament` mapping; the first run is a dry run returning a summary the user confirms.

**Code:** `vsslicer/modules/filament-spoolman/src/application/...` (module: `filament-spoolman`, layer: `application`)

## Acceptance criteria

- [ ] Import of a Docker instance and of `/export` files into an empty store gives the same inventory
- [ ] Mapping round trip: export local to Spoolman and import into an empty store keeps superset fields through `extra`
- [ ] Dry run changes nothing and lists what would be created

## Tasks

- [ ] Write the importer
- [ ] Dry-run summary
- [ ] Round-trip test

## Progress

Not started.
