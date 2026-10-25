---
id: 122
title: "Define ImportResult, Diagnostic and the printer-instance import result types"
type: feature
priority: P0
effort: S
model: sonnet
area: [importers]
story: US18
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [1, 2]
created: 2026-10-25
---

The shared result shape every ecosystem adapter returns and the core consumes: `ImportResult {entities, native, diagnostics}`, one diagnostic type, and an instance import result that carries a credential separately from the entity.

**Code:** `vsslicer/modules/profile-api/src/domain/import-result/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] `Diagnostic` has severity, code, file, line and message; the codes of the epic (cycle, unknown parent, malformed line, invalid JSON, unknown type, unreadable folder, credential-missing) exist as a closed union
- [ ] `InstanceImport {entity, credential?}` keeps the credential outside the entity type (type test: the entity type has no credential field)
- [ ] Type tests fail if a field is dropped

## Tasks

- [ ] Write the types
- [ ] Add the type tests

## Progress

Not started.
