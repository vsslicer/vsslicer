---
id: 45
title: "Assemble the Bambu adapter: connect, status and read-only mode"
type: feature
priority: P1
effort: M
model: opus
area: [bambu]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [39, 40, 34, 35]
created: 2026-10-25
---

The `PrinterAdapter` for Bambu with status, HMS and the capability set chosen by the `fun` flag.

**Code:** `vsslicer/modules/printer-bambu/src/application/...` (module: `printer-bambu`, layer: `application`)

## Acceptance criteria

- [ ] The E20 contract kit passes against ha-bambulab `mock_data` and the fake broker with its self-signed CA
- [ ] `fun` disabled gives read-only status and control commands report 'requires Developer Mode'
- [ ] `probe` identifies a Bambu printer by serial and model

## Tasks

- [ ] Adapter composition
- [ ] Kit run
- [ ] Mode F tests

## Progress

Not started.
