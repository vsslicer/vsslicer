---
id: 81
title: Define Spoolman wire types and external id pairs
type: feature
priority: P2
effort: S
model: sonnet
area: [spoolman]
story: US34
milestone: "VSS:M4"
sprint: "VSS:SP33"
depends_on: [80]
created: 2026-10-25
---

Types for vendor, filament, spool, `extra`, `/export` and the change events; a bookkeeping value pairing local ids with Spoolman ids (`external_id`).

**Code:** `vsslicer/modules/filament/spoolman/src/domain/...` (module: `filament-spoolman`, layer: `domain`)

## Acceptance criteria

- [ ] Types validate against the recorded OpenAPI fixture's example payloads
- [ ] The id pairing round-trips and refuses to map two local entities to one remote id

## Tasks

- [ ] Write the types
- [ ] Pairing
- [ ] Fixture tests

## Progress

Not started.
