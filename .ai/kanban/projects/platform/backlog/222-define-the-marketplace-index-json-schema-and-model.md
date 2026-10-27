---
id: 222
title: Define the marketplace index.json schema and model
type: feature
priority: P0
effort: M
model: sonnet
area: [registry]
story: US72
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [110]
created: 2026-10-27
---

The contract between the static marketplace and the VSSlicer extensions view (D24). The view's adapter (PLT-209) pins a copy of the schema by version.

**Code:** `src/domain/index-model.ts` and `schema/index.schema.json` (repo: `vsslicer/vsslicer-marketplace`, layer: `domain`)

## Acceptance criteria

- [ ] `index.json` carries `schemaVersion`, `generatedFrom` (release list and timestamp) and, per extension: `id` (`publisher.name`), `displayName`, `description`, `licence` (SPDX), `repository`, and per version: `version`, `engines.vscode`, `extensionDependencies`, `vsixUrl`, `sha256`, `size`, `releasedAt`
- [ ] A JSON Schema validates it; the TypeScript types are generated from or tested against it
- [ ] `serialize(model)` is key-sorted and deterministic (same input, same bytes)
- [ ] Tests: a valid fixture passes; a missing `sha256`, a bad SPDX expression and a non-semver version fail by path

## Tasks

- [ ] Schema
- [ ] Model and serializer
- [ ] Tests
