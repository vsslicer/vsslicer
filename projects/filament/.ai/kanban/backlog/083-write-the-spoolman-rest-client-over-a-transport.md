---
id: 83
title: Write the Spoolman REST client over a transport
type: feature
priority: P2
effort: M
model: sonnet
area: [spoolman]
story: US34
milestone: "VSS:M4"
depends_on: [81]
created: 2026-10-25
---

CRUD for vendors, filaments and spools, `PUT /spool/{id}/use`, `PUT /spool/{id}/measure`, `/export`, pagination and typed errors, over a `SpoolmanTransport` with the direct HTTP implementation (the Moonraker proxy is the second).

**Code:** `vsslicer/modules/filament-spoolman/src/adapters/...` (module: `filament-spoolman`, layer: `adapters`)

## Acceptance criteria

- [ ] Contract tests against Spoolman in Docker: import, create, edit, `use`, `measure`, delete (image tag pinned and recorded)
- [ ] 404, timeout and rejected write each return a typed error

## Tasks

- [ ] Write the transport port and the HTTP one
- [ ] Write the client
- [ ] Contract tests

## Progress

Not started.
