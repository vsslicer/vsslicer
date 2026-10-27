---
id: 356
title: Implement the SerialLink over serialport
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [350, 355, 345]
created: 2026-10-25
---

The real side of the port: opens a device path at a baud rate, controls DTR and RTS so a reset on connect can be turned off, reads lines and maps operating-system errors to `PrinterError` kinds.

**Code:** `vsslicer/modules/printer/serial/src/adapters/...` (module: `printer-serial`, layer: `adapters`)

## Acceptance criteria

- [ ] Streams a fixture file to the emulator over the pty pair on Linux and macOS in CI
- [ ] `EACCES` maps to `refused` with a hint field naming the `dialout` group, `ENOENT` to `unreachable`, an already-open port to `busy` (tests with the mock binding)
- [ ] Closing the link releases the port; a second open then succeeds

## Tasks

- [ ] Open, close, write, read
- [ ] DTR/RTS options
- [ ] Error mapping
- [ ] pty and mock-binding tests

## Progress

Not started.
