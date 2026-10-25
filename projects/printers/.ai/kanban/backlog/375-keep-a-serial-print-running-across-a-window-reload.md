---
id: 375
title: Keep a serial print running across a window reload
type: chore
priority: P2
effort: M
model: sonnet
area: [serial]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP31"
depends_on: [373, 73]
created: 2026-10-25
---

Integration test with the agent: start a print to the emulator, reload the window, and check the agent still holds the port and the print finishes with the right lines.

**Code:** `vsslicer/modules/printers-serial-extension/src/presentation/...` (module: `printers-serial-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] After a window reload the print continues and completes; the emulator received every line once
- [ ] Deactivating the extension host only detaches (the agent keeps the session)
- [ ] Verified on the emulator only; the H2C has no serial print path

## Tasks

- [ ] Test harness with the agent
- [ ] Reload scenario
- [ ] Detach scenario

## Progress

Not started.
