---
id: 82
title: Write project_settings.config and embedded preset JSONs from supplied native content
type: feature
priority: P1
effort: S
model: sonnet
area: [3mf]
story: US30
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [78, 21]
created: 2026-10-25
---

Writes `project_settings.config` and the embedded preset JSON parts from content the caller supplies (the writer imports no profile module). Without new content the originals are kept.

**Code:** `vsslicer/modules/core/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] Given native JSON for printer, filament and process, the parts are written byte-exact from it
- [ ] Given no content, the original bytes are preserved
- [ ] An invalid JSON string is rejected with a named error before anything is written

## Tasks

- [ ] Writer for the config and preset parts
- [ ] Input type for supplied content
- [ ] Tests

## Progress

Not started.
