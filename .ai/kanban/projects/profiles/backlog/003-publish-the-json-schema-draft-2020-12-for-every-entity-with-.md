---
id: 3
title: Publish the JSON Schema (draft 2020-12) for every entity with positive and negative fixtures
type: feature
priority: P0
effort: M
model: sonnet
area: [schema]
story: US1
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [2]
created: 2026-10-25
---

The machine-readable schema that VS Code's JSON service and the importers validate against.

**Code:** `vsslicer/modules/profile-api/src/domain/schema/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] One schema file per entity plus a shared `$defs` file; generated from or checked against the TypeScript types so they cannot drift (a test fails when they disagree)
- [ ] Every hand-written positive fixture validates; every negative fixture fails with the expected JSON path (missing `id`, bad `host_type` shape, unknown `abstract` type, positional array where a keyed map is required)
- [ ] `secret_ref` is accepted but a `password`, `apikey` or `access_code` property in `connection` fails validation
- [ ] Verified on fixtures only (D5)

## Tasks

- [ ] Write the schemas
- [ ] Add the types-versus-schema consistency test
- [ ] Write 8 positive and 12 negative fixtures

## Progress

Not started.
