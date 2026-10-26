---
id: 26
title: "Connect the registry to the profiles extension's printer instances"
type: feature
priority: P0
effort: S
model: sonnet
area: [api]
story: US6
milestone: "VSS:M3"
sprint: "VSS:SP17"
depends_on: [25, 24, PRF-86]
created: 2026-10-25
---

Call `vsslicer.profiles` `getConnection` at runtime (no compile-time dependency) and export `hostTypes()` so the instance form lists registered adapters.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

UNRESOLVED: needs profiles-extension (`getConnection`) and profile-api (`printer_instance`).

## Acceptance criteria

- [ ] A printer created from a `printer_instance` opens a session through the registered adapter (integration test with a stub profiles extension that returns a connection)
- [ ] Without `vsslicer.profiles` installed, manual add still works

## Tasks

- [ ] Provider over the extension API
- [ ] Export hostTypes
- [ ] Integration test with a stub

## Progress

Not started.
