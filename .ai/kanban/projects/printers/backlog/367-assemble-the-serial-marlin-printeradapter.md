---
id: 367
title: Assemble the serial-marlin PrinterAdapter
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [358, 360, 361, 362, 366]
created: 2026-10-25
---

Composes session, streamer, SD operations and discoverer into the adapter descriptor `serial-marlin` with no auth scheme, the module path the agent loads, and capabilities from what is built.

**Code:** `vsslicer/modules/printer/serial/src/application/...` (module: `printer-serial`, layer: `application`)

## Acceptance criteria

- [ ] The adapter type-checks against `@vsslicer/printer-api` and a type test confirms a serial-shaped adapter compiles with only `upload` and `telemetryPoll`
- [ ] `remoteWorkspaceSafe` is false and documented
- [ ] Opening twice on the same port gives `busy`

## Tasks

- [ ] Descriptor
- [ ] Assembly
- [ ] Type test

## Progress

Not started.
