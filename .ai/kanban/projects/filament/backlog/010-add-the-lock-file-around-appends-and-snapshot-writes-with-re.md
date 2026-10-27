---
id: 10
title: "Add the lock file around appends and snapshot writes, with reload on change"
type: feature
priority: P1
effort: M
model: opus
area: [model]
story: US3
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [9, 8]
created: 2026-10-25
---

Multi-window safety: an advisory lock around appends and snapshot writes, stale-lock recovery and a reload when another process changed the files.

**Code:** `vsslicer/modules/filament/filament/src/adapters/...` (module: `filament`, layer: `adapters`)

## Acceptance criteria

- [ ] Two processes appending concurrently under the lock produce a valid log with every event once (Node child-process test)
- [ ] A lock held by a dead process is recovered after the stale timeout; a lock timeout raises a typed `LockTimeoutError`
- [ ] A change made by another process is detected and surfaced to the store consumer

## Tasks

- [ ] Implement the lock
- [ ] Implement change detection
- [ ] Child-process tests

## Progress

Not started.
