---
id: US3
title: "My inventory survives crashes, two windows and upgrades"
status: reviewed
epic: VSS:E40
---

As a spool owner with several VS Code windows, I want the store to detect torn writes, serialise concurrent writers and migrate forward with a backup, so that a crash, a second window or an upgrade never loses my inventory.

## Acceptance criteria

- [ ] A truncated last line in `events.jsonl` is quarantined to a `.corrupt` file and reported; earlier events load
- [ ] Two processes appending concurrently under the lock produce a valid log with every event once (Node child-process test)
- [ ] The lock is proven on Windows, macOS and Linux CI, or the single-writer fallback is chosen in a recorded spike
- [ ] Migration from schema v1 to a test v2 keeps a backup and is reversible by restoring it
- [ ] Replay of 100,000 events stays under 200 ms (benchmark test)

## Out of scope

- Cross-machine sync of the store
