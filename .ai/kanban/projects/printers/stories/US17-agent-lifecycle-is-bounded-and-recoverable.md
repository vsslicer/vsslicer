---
id: US17
title: "The agent shuts down when idle, restarts after a crash, and never delays deactivate"
status: reviewed
epic: VSS:E22
---

As a user, I want the agent to stop when I have no window and no job, to come back after a crash with sessions re-opened, and to leave `deactivate` fast, so that it never becomes a resource leak or a hang.

## Acceptance criteria

- [ ] Idle shutdown after N minutes with no window and no active job (unit test with a fake clock)
- [ ] Crash test: kill the agent; the extension restarts it, sessions re-open, the tree view shows a 'reconnected' state and no unhandled error
- [ ] `deactivate` completes in under 1 s with an active session (timed in the test)
- [ ] Setting `vsslicer.printers.useAgent` (default on after the epic): off keeps the in-process sessions and the E20/E21 suites still pass; an agent start failure shows an error with the log path and falls back to in-process sessions with a warning
- [ ] A version-skew test: an older extension and a newer agent negotiate or the agent is restarted

## Out of scope

- Auto-update of the agent outside the extension.
