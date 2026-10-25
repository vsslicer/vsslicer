---
id: 6
title: "Define the adapter, session, discoverer and camera-source ports"
type: feature
priority: P0
effort: M
model: opus
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [4, 5, 3]
created: 2026-10-25
---

The ports adapters implement: `PrinterAdapter`, `Session`, `Discoverer`, `CameraSource`, `SecretStore`, the adapter registration descriptor and the streaming upload.

**Code:** `vsslicer/modules/printer-api/src/application/...` (module: `printer-api`, layer: `application`)

## Acceptance criteria

- [ ] `PrinterAdapter` (id, label, auth schemes, capabilities, `probe(endpoint)`, `open(connection, secrets)`), `Session` (status, `subscribe`, job, files, upload), `Discoverer`, `CameraSource` and `SecretStore` are types only
- [ ] Upload takes a stream, emits progress and honours `AbortSignal`; a registration descriptor carries id, label, host type and the module path the daemon loads
- [ ] Type test: a Marlin-serial-shaped adapter implementing only `upload` and `telemetryPoll` compiles with `tsc --noEmit`; the same test fails to compile when a required member is removed

## Tasks

- [ ] Write the ports
- [ ] Write the descriptor
- [ ] Add the thin-adapter type tests

## Progress

Not started.
