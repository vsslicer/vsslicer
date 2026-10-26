---
id: 46
title: Re-index files edited outside VSSlicer within one second
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US20
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [45, 135]
created: 2026-10-25
---

File watching so git checkouts and text edits show up; an invalid file keeps the last valid version resolvable and gives a diagnostic.

**Code:** `vsslicer/modules/profiles/src/adapters/fs-store/watch/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [ ] A file edited on disk is re-indexed within 1 s (timing test)
- [ ] An edit that breaks the JSON emits a diagnostic through `onDidChange` and `get` still returns the last valid version
- [ ] A burst of 500 file changes (a git checkout) is coalesced into one index update

## Tasks

- [ ] Write the watcher
- [ ] Coalesce bursts
- [ ] Tests

## Progress

Not started.
