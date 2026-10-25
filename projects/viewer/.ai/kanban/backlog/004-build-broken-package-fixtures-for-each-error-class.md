---
id: 4
title: Build broken-package fixtures for each error class
type: chore
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US1
milestone: "VSS:M2"
depends_on: [3, PLT-13]
created: 2026-10-25
---

Small deterministic packages for every error class, built at test time or committed under the size cap, so each reader card can test its failures.

**Code:** `vsslicer/modules/3mf/test/fixtures/broken/` and a builder in `vsslicer/modules/3mf/test/` (module: `3mf`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] A fixture or builder exists for corrupt zip, missing root model, malformed XML, unsupported required extension, zip bomb (declared size above cap) and Production path to a missing part
- [ ] `PROVENANCE.md` states how each was made; no file is over 5 MB (`tools/check-fixtures` passes)

## Tasks

- [ ] Write the builder
- [ ] Commit the small fixtures
- [ ] Write PROVENANCE.md

## Progress

Not started.
