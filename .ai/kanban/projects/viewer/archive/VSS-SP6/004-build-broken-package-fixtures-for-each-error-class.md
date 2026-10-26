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
sprint: "VSS:SP6"
depends_on: [3, PLT-13]
created: 2026-10-25
---

Small deterministic packages for every error class, built at test time or committed under the size cap, so each reader card can test its failures.

**Code:** `vsslicer/modules/3mf/test/fixtures/broken/` and a builder in `vsslicer/modules/3mf/test/` (module: `3mf`, layer: n/a (fixtures))

## Acceptance criteria

- [x] A fixture or builder exists for corrupt zip, missing root model, malformed XML, unsupported required extension, zip bomb (declared size above cap) and Production path to a missing part
- [x] `PROVENANCE.md` states how each was made; no file is over 5 MB (`tools/check-fixtures` passes)

## Tasks

- [x] Write the builder
- [x] Commit the small fixtures
- [x] Write PROVENANCE.md

## Progress

Done. A deterministic builder, `vsslicer/modules/3mf/test/fixtures/make-broken.ts` (run `node test/fixtures/make-broken.ts` in the module), writes six committed fixtures (about 1 KB each) into `test/fixtures/broken/`: corrupt zip (cut inside the central directory), missing root model (start-part rel points at an absent part), malformed XML, unsupported required extension, zip bomb (central directory declares 4 GiB for a small entry), Production path to a missing part. `PROVENANCE.md` states how each is made. Supporting test code: `test/support/zipBuilder.ts` (stored/deflated, data descriptors, zip64, lying sizes) and `test/support/minimalPackage.ts`.
Verified: `node vsslicer/scripts/check-fixtures.mjs` passes; fixtures are consumed by `test/zip.test.ts` (VWR-5). Not covered: fixtures for the XML-level classes are only consumed once their reader cards land.
Changelog: VWR-4: broken-package fixtures for each error class, and the test zip builder.


Review passed (vwr456-reviewer): lint/build/test (35) and check-fixtures.mjs pass; six fixtures under 1 KB each, deterministic builder, PROVENANCE.md matches; corrupt-zip and zip-bomb fixtures give the typed errors.
