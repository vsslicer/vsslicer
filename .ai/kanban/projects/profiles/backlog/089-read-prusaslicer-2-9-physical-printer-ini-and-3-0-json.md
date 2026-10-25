---
id: 89
title: Read PrusaSlicer 2.9 physical_printer INI and 3.0 JSON
type: feature
priority: P0
effort: M
model: sonnet
area: [importers, store]
story: US36
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [24, 136]
created: 2026-10-25
---

Reads physical printers as an instance entity plus a separate credential value (`printhost_apikey`, `printhost_password`), never putting the credential into the entity.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/physical/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] Fixture physical printers with known credentials yield an instance (model, nozzle, host, `host_type`) and a separate credential; the entity JSON does not contain the credential string
- [ ] Unknown host types import with a diagnostic and no connection
- [ ] The source file is not modified

## Tasks

- [ ] Write the INI reader
- [ ] Write the 3.0 JSON reader
- [ ] Tests

## Progress

Not started.
