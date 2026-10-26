---
id: 38
title: Implement the import use cases over registered importers
type: feature
priority: P0
effort: M
model: opus
area: [importers]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP12"
depends_on: [137, 138, 139, 136, 118]
created: 2026-10-25
---

The core use cases that route a source to the registered `Importer`s, collect `ImportResult`s and diagnostics, and never let one failing importer stop the others. Importer ports and result types come from `profile-api`.

**Code:** `vsslicer/modules/profiles/src/application/import/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With fake importers registered, a failing importer yields a diagnostic with a code and the others' entities still arrive; each failure kind (cycle, unknown parent, malformed line, invalid JSON, unknown type, unreadable folder) has a code passed through unchanged
- [ ] The use cases run against an in-memory source in plain Node (no VS Code)
- [ ] No entity that fails schema validation is returned; it becomes a diagnostic instead
- [ ] The same contract suite `runImporterContract` from `profile-api` passes against the registry as a composite importer

## Tasks

- [ ] Write the importer registry
- [ ] Write the use cases
- [ ] Tests with fake importers

## Progress

Not started.
