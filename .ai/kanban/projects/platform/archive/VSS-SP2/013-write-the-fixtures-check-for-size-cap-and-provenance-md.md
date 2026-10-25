---
id: 13
title: Write the fixtures check for size cap and PROVENANCE.md
type: feature
priority: P1
effort: S
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-13-worker
depends_on: [9]
created: 2026-10-25
---

Module: `vsslicer/scripts` (`run.mjs checks`, a repository check; `tools/generate-large-fixture` reads as `vsslicer/scripts/generate-large-fixture`). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Keeps the repository small: no fixture over 5 MB, every `fixtures/` folder has `PROVENANCE.md` (generator, version, settings, licence). Large inputs (the 50, 200 and 500 MB G-code budget files) are generated in CI.

## Acceptance criteria

- [x] A 6 MB file in a fixture folder fails the check
- [x] A fixture folder without `PROVENANCE.md` fails
- [x] `tools/generate-large-fixture` is a stub with a documented interface that GCP fills; CI caches its output
- [x] The check runs in CI

## Tasks

- [x] Implement `tools/check-fixtures`
- [x] Add negative fixtures built at test time (not committed)
- [x] Document the generator interface

## Progress

Done. `tools/` reads as `vsslicer/scripts/`. `scripts/check-fixtures.mjs` (run by `node scripts/run.mjs checks`, hence `ci` and the workflow) fails any file over 5 MB under `vsslicer/fixtures/` or `vsslicer/modules/*/test/fixtures/`, and any folder directly under such a root lacking `PROVENANCE.md` (per GCP-2's per-generator folders). `modules/tooling/test/fixtures` is exempt from PROVENANCE only (hand-written violations; adding files would edit tooling). `scripts/generate-large-fixture.mjs` is a stub (`--kind gcode --size 500MB --seed N --out path`, exit 2 not implemented), documented in CONTRIBUTING.md; ci.yml caches `vsslicer/.cache/large-fixtures` (actions/cache v6.1.0, SHA-pinned) keyed by the generator hash.
Verified: `scripts/test/check-fixtures.test.mjs` builds passing, 6 MB and no-PROVENANCE repos in a temp dir; runner tests 25 pass; `checks` passes on the real repo.
Files: vsslicer/scripts/check-fixtures.mjs, scripts/test/check-fixtures.test.mjs, scripts/generate-large-fixture.mjs, scripts/run.mjs (3 lines), vsslicer/.gitignore (.cache), .github/workflows/ci.yml, CONTRIBUTING.md.
