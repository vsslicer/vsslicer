---
id: 9
title: "Run an engine process: argv without shell, line streams, timeout, exit and signal result"
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [8]
created: 2026-10-25
---

Spawns a child process from an argv array (never a shell), streams stdout and stderr as lines, enforces a timeout and returns exit code or signal.

**Code:** `vsslicer/modules/slicer-runtime/src/adapters/...` (module: `slicer-runtime`, layer: `adapters`)

## Acceptance criteria

- [ ] Stub-binary tests on all three OS runners: exit code, signal (POSIX), timeout, large output without a deadlock
- [ ] No shell is involved: an argument with spaces, quotes and `;` reaches the child unchanged (test)
- [ ] A hung child is killed when the timeout expires and the result says so

## Tasks

- [ ] Runner
- [ ] Line splitter
- [ ] Stub binaries and tests

## Progress

Not started.
