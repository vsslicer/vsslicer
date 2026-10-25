---
id: 373
title: Register the serial adapter and show ports in Add printer
type: feature
priority: P2
effort: M
model: sonnet
area: [serial]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [371, 369, 339, 126]
created: 2026-10-25
---

On activation registers `serial-marlin` with `vsslicer.printers`, with the module path the agent loads; the Add printer form asks for the port (filled from the agent's discovery), the baud rate and whether to reset on connect.

**Code:** `vsslicer/modules/printers-serial-extension/src/presentation/...` (module: `printers-serial-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the extension installed, Add printer lists Marlin serial and the ports from the agent's `printer.discover`; without it the host type is reported as not installed
- [ ] Nothing native is loaded until a serial printer is opened (test)
- [ ] Integration test with a stub `vsslicer.printers` checks the descriptor

## Tasks

- [ ] Activation
- [ ] Descriptor
- [ ] Form fields
- [ ] Integration test

## Progress

Not started.
