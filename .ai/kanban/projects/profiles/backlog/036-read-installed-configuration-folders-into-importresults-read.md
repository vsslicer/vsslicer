---
id: 36
title: "Read installed configuration folders into ImportResults, read-only"
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [35, 38, 135]
created: 2026-10-25
---

Walks a located folder and passes its files to the registered importers; never writes.

**Code:** `vsslicer/modules/profiles/src/adapters/installed/` (module: `profiles`, layer: `adapters`)

## Acceptance criteria

- [ ] With fake importers, a fixture folder yields the importers' entities; the real adapters are exercised by the extension's `cmd_import` integration test
- [ ] A checksum of the whole source tree is identical before and after (test)
- [ ] An unreadable subfolder gives a diagnostic and the rest import

## Tasks

- [ ] Write the walker
- [ ] Add the checksum test

## Progress

Not started.
