---
id: 355
title: "Add emulator transports: in-memory and a pty pair"
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US60
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [353]
created: 2026-10-25
---

Two ways to reach the emulator: an in-memory duplex for unit tests and a pty pair (created with `socat` on Linux and macOS in CI) so the real `serialport` binding is exercised. Windows CI uses the in-memory duplex and the `serialport` mock binding.

**Code:** `vsslicer/modules/printer/serial/src/adapters/testing/` (module: `printer-serial`, layer: `adapters`)

## Acceptance criteria

- [ ] The same emulator test passes over both transports on Linux and macOS; on Windows the in-memory transport runs and the pty test skips with a stated reason
- [ ] The pty helper cleans up its processes on test failure (test kills the runner mid-test and finds no stray `socat`)

## Tasks

- [ ] In-memory transport
- [ ] pty helper
- [ ] Windows skip

## Progress

Not started.
