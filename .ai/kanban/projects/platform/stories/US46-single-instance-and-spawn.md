---
id: US46
title: "Two windows starting at once end up on one daemon"
status: reviewed
epic: VSS:E19
---

As a user with several VS Code windows, I want exactly one agent daemon whichever window starts it, so that printer sessions are shared rather than duplicated.

## Acceptance criteria

- [ ] Two clients started at the same moment with no daemon running end up connected to one server process, repeated 50 times in CI
- [ ] `AgentClient` connects to an existing daemon or spawns the executable path the caller supplies, and waits for readiness with a timeout and a named error
- [ ] A stale lock or socket left by a crashed daemon is detected and replaced (test with a killed process)

## Out of scope

- The daemon executable, its packaging and auto-start (E22); choosing the Electron-as-Node child-process method (shared spike, SLC).
