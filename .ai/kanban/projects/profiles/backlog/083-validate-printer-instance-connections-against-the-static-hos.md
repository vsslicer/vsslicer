---
id: 83
title: Validate printer_instance connections against the static host_type list
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US34
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [3]
created: 2026-10-25
---

In M2 `host_type` is a plain string checked against a static list of the D3 values (bambu-lan, moonraker, octoprint, prusalink, duet); E20 will later read instances from here and register adapters, so E16 does not wait for it.

**Code:** `vsslicer/modules/profile-api/src/domain/entities/printer-instance/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] `connection {host_type, url, secret_ref}` validates for each of the five host types and fails for an unknown one with the path `connection.host_type`
- [ ] Toolhead slots and nozzles resolve per extruder for an H2C dual-nozzle fixture (slot 0 and slot 1 each name a nozzle entity)
- [ ] A `connection` carrying a credential-like property (`password`, `apikey`, `access_code`, `token`) fails validation

## Tasks

- [ ] Add the host-type list and validation
- [ ] Resolve toolhead slots
- [ ] Tests

## Progress

Not started.
