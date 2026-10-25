---
id: 21
title: Add the VSIX packaging task with content assertion and size budget
type: feature
priority: P0
effort: M
model: sonnet
area: [publishing]
story: US5
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-21-worker
depends_on: [3, 12]
created: 2026-10-25
---

Module: `tooling` (package helper), used by every extension module's `pnpm package`. Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

## Acceptance criteria

- [x] VSIX contains exactly bundle, `package.json`, `LICENSE`, `THIRD-PARTY-NOTICES.md`, `README.md`, `CHANGELOG.md` and declared assets; no `node_modules`, tests or `.map` files
- [x] Size is printed; a per-extension budget in `package.json` fails the job when exceeded (test with a bloated fixture)
- [x] `repository` link at the release tag and licence expression are present

## Tasks

- [x] Write the package helper (`vsslicer-package` bin in `vsslicer/modules/tooling`)
- [x] Add the assertions
- [x] Add the bloated and map-file negative fixtures
- [x] Wire `package`

## Progress

Done. "Repository root" read as `vsslicer/`; the helper is the `vsslicer-package` bin of `tooling` 0.7.0 (wraps `@vscode/vsce` 3.9.2, `--no-dependencies`, run in a tmp copy because vsce rejects scoped names and ignores negations in `files`; content decided by the module's `.vscodeignore`). Asserts exact VSIX content, size vs `"vsslicer": {"sizeBudgetKB"}`, `repository` containing the tag `<name>@<version>`, licence, publisher. Documented in CONTRIBUTING.md "VSIX package".

Verified: `modules/tooling/test/package.test.mjs` (fake extension built in tmp: clean pass, map/meta/src leaks, missing CHANGELOG, 200 KB bloat over a 50 KB budget, manifest checks); tooling lint/build/test green (42 tests); `pnpm package` in example-extension 0.5.0: 17.0 KB of 200 KB, 9 entries; empty-store frozen installs for tooling and example-extension; both published to the local registry.

Not done: the real repository URL (placeholder `<owner>`, Q7); no marketplace publishing (Q8).

Files: vsslicer/modules/tooling/{bin/vsslicer-package.mjs,test/package.test.mjs,package.json,pnpm-lock.yaml,pnpm-workspace.yaml,CHANGELOG.md}; vsslicer/modules/example-extension/{package.json,pnpm-lock.yaml,pnpm-workspace.yaml,.vscodeignore,README.md,CHANGELOG.md}; CONTRIBUTING.md; .reference/notes/PLT-21-vsix-packaging.md.
