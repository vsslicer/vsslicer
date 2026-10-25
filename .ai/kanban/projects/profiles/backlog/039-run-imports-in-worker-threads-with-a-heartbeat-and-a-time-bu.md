---
id: 39
title: Run imports in worker_threads with a heartbeat and a time budget
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [38, 135]
created: 2026-10-25
---

A worker runner so a 14 420-file import cannot block the extension host; a crash becomes a diagnostic.

**Code:** `vsslicer/modules/profiles/src/adapters/worker/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [ ] `PrusaResearch.ini` and the full Orca tree each import in under 10 s on CI, with the host-side heartbeat never missing a beat by more than 200 ms
- [ ] A worker crash fixture returns a diagnostic and the next import works
- [ ] Cancel stops the worker within 1 s

## Tasks

- [ ] Write the runner and message types
- [ ] Add the heartbeat test
- [ ] Add crash and cancel tests

## Progress

Not started.
