---
id: 67
title: Contribute jsonValidation and schema completion for profile files
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US28
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [57, 135]
created: 2026-10-25
---

Maps E11's JSON Schema onto `.vsslicer/profiles/**/*.json` so VS Code's JSON service gives completion and hover.

**Code:** `vsslicer/modules/profiles-extension/package.json` contributes and the bundled schema (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] In an integration test completion inside `settings` offers catalogue keys, and a wrong type shows a schema error
- [ ] The shipped schema files are the published E11 files (hash test)

## Tasks

- [ ] Add contributes.jsonValidation
- [ ] Bundle the schema
- [ ] Integration test

## Progress

Not started.
