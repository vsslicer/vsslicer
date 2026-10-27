---
id: 374
title: Explain serial permissions and remote windows
type: feature
priority: P2
effort: S
model: sonnet
area: [serial]
story: US64
milestone: "VSS:M5"
sprint: "VSS:SP43"
depends_on: [373, 356]
created: 2026-10-25
---

Turns the `refused` error with its hint into a message naming the `dialout` or `uucp` group and the command, and says in Remote-SSH, WSL and dev-container windows that the ports belong to the local machine.

**Code:** `vsslicer/modules/apps/printers-serial/src/presentation/...` (module: `printers-serial-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A `refused` error on Linux shows the group and command; on macOS and Windows it shows the generic permission text (unit test of the message builder)
- [ ] In a remote window the form states where the ports are and why the list may be empty (integration test with `remoteName` set)

## Tasks

- [ ] Message builder
- [ ] Remote notice
- [ ] Tests

## Progress

Not started.
