---
id: 11
title: "Write tools/check-licence for package fields, SPDX headers and ported-file provenance"
type: feature
priority: P1
effort: M
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
depends_on: [9, 6]
created: 2026-10-25
---

Module: `tooling` (bin `check-licence`). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Catches what Open VSX would reject and ports without provenance (D2): `package.json` licence field, SPDX header in every source file, upstream copyright line next to every `Ported from <project>@<commit>:<path>` line.

## Acceptance criteria

- [x] Fixture with a missing `license` field fails
- [x] Fixture source file without the SPDX header fails
- [x] Fixture with `Ported from` but no upstream copyright line fails
- [x] The real repository passes; the check runs in the `lint` task and in CI

## Tasks

- [x] Define rules and ignore list
- [x] Implement the checker
- [x] Write failing fixtures and vitest tests
- [x] Wire into CI

## Progress

Done. Code is under `vsslicer/` (read "repository root" as that). `tooling` 0.5.0 adds bin `check-licence [dir...]` with rules `package-license`, `spdx-header`, `ported-copyright` (documented in CONTRIBUTING.md "Licence check"). "Lint task" maps to `checks` under the module model: it runs from tooling's own `lint` and from `node scripts/run.mjs checks` (also at the end of `ci`, so CI) over all modules plus `fixtures/phantom-dep`. Real modules pass.

Verified: tooling lint/build/test (24 pass), 3 failing fixtures + 1 passing in `test/licence.test.mjs`, CLI exit 1 on failing fixtures, `run.mjs checks` exit 0, runner tests 22/22. Published tooling 0.5.0; `example` moved to ^0.5.0, empty-store frozen install, lint, test, build OK. `example-extension` NOT updated (PLT-14 owns it).

Files: modules/tooling/{bin/check-licence.mjs,package.json,CHANGELOG.md,eslint.config.mjs,.prettierignore,test/licence.test.mjs,test/fixtures/licence/**}, modules/example/{package.json,pnpm-lock.yaml}, scripts/run.mjs, CONTRIBUTING.md, .reference/notes/PLT-11-check-licence.md.
