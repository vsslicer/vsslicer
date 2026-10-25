---
id: 18
title: "Apply a catalogue import: update in place, keep edits, redirect, mark stale"
type: feature
priority: P1
effort: L
model: opus
area: [import]
story: US8
milestone: "VSS:M4"
depends_on: [17]
created: 2026-10-25
---

The merge use case behind every import (OFD, SpoolmanDB): upstream changes update records in place, user-edited fields survive, `moved_from` redirects keep spool references and upstream deletions mark records stale unless a spool references them. Also revert-last-import.

**Code:** `vsslicer/modules/filament/src/application/...` (module: `filament`, layer: `application`)

## Acceptance criteria

- [ ] Re-import of a second fixture revision: changed upstream fields update, user-edited fields survive, `moved_from` redirects keep spool references, deleted records referenced by a spool are marked stale and kept (catches silent loss of a spool's catalogue link)
- [ ] The import is transactional through the store port: a failure midway leaves the previous catalogue untouched
- [ ] `revertLastImport` restores the previous catalogue

## Tasks

- [ ] Write the merge
- [ ] Write redirects and stale handling
- [ ] Write revert
- [ ] Tests with two fixture revisions

## Progress

Not started.
