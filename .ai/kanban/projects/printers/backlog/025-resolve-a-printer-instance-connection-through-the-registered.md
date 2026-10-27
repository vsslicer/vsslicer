---
id: 25
title: Resolve a printer_instance connection through the registered host types
type: feature
priority: P0
effort: M
model: opus
area: [api]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [17, PRF-136]
created: 2026-10-25
---

Replace the static `host_type` list of the printer_instance connection with the registry's registered adapters (E16 defines `connection {host_type, url, secret_ref}`).

**Code:** `vsslicer/modules/apps/printers/src/application/...` (module: `printers-extension`, layer: `application`)

Wiring to the profiles extension's `getConnection(instanceId)` and `printer_instance` type is UNRESOLVED (profile-api, profiles-extension).

## Acceptance criteria

- [ ] `hostTypes()` returns the registered adapters (id, label, auth schemes); `connectionFor(instanceId)` validates the instance's `host_type` against them via a `ConnectionProvider` port
- [ ] An unknown host type gives a typed 'adapter not installed' result with the host type named; a secret is handed only to the adapter that registered the host type
- [ ] Two implementations of the port exist today: the profiles-extension provider and the manual settings provider; unit tests with both fakes

## Tasks

- [ ] Write the port and resolver
- [ ] Host type listing
- [ ] Unit tests

## Progress

Not started.
