---
id: 11
title: Stage output in a temp directory and commit it only on success
type: feature
priority: P0
effort: S
model: sonnet
area: [engine]
story: US5
milestone: "VSS:M3"
sprint: "VSS:SP11"
depends_on: [9]
created: 2026-10-25
---

A staging directory per job and an atomic commit of its files into `.vsslicer/sliced/`. Cancel, failure or crash removes the staging directory; nothing partial is ever visible.

**Code:** `vsslicer/modules/slicer-runtime/src/adapters/...` (module: `slicer-runtime`, layer: `adapters`)

## Acceptance criteria

- [ ] Commit moves files atomically (rename, falling back to copy then rename across devices) and refuses to overwrite silently: an existing name gets a suffix
- [ ] Cancel or failure leaves `.vsslicer/sliced/` byte-identical to before (test)
- [ ] Stale staging directories from a killed host are removed on next start

## Tasks

- [ ] Staging dir lifecycle
- [ ] Atomic commit
- [ ] Failure tests

## Progress

Not started.
