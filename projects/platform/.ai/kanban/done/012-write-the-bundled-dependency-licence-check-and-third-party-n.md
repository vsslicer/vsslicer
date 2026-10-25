---
id: 12
title: Write the bundled-dependency licence check and THIRD-PARTY-NOTICES generator
type: feature
priority: P1
effort: M
model: sonnet
area: [ci]
story: US3
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-12-worker
depends_on: [11, 3]
created: 2026-10-25
---

Module: `tooling` (licence check and notices generator). Module model: `.ai/instructions.md` "Architecture rules" and D12 (independent modules in `vsslicer/modules/<name>/`, local Verdaccio registry, `scripts/run.mjs`).

Walks each extension's bundled production dependencies (from the esbuild metafile), fails on a licence outside the allow-list (AGPL-3.0, GPL-3.0, LGPL-2.1/3.0, MIT, BSD-2/3, ISC, Apache-2.0, MPL-2.0, CC0, Zlib), and writes `THIRD-PARTY-NOTICES.md` per extension.

## Acceptance criteria

- [x] A fixture dependency marked `UNLICENSED` fails the check
- [x] A fixture dependency with a non-allow-listed licence fails
- [x] The sample extension's `THIRD-PARTY-NOTICES.md` lists every bundled dependency with licence text; output is deterministic
- [x] Dual-licence expressions (`MIT OR GPL-3.0`) are evaluated against the allow-list

## Tasks

- [x] Read the esbuild metafile and resolve package licences
- [x] Implement allow-list and SPDX expression handling
- [x] Generate the notices file
- [x] Add failing fixtures and tests

## Progress

Done in `vsslicer/modules/` (read "repository root" as `vsslicer/`). tooling 0.6.0 adds the `third-party-notices` bin; `vsslicer-bundle` writes the esbuild metafile. example-extension 0.4.0 builds and ships `THIRD-PARTY-NOTICES.md`. Both published to the local registry; example untouched.

Verified: tooling `node --test` 37/37, lint clean; example-extension lint/build/test green; empty-store `CI=true npm_config_store_dir=<tmp> pnpm install --frozen-lockfile` OK for both. Fixtures are fake pnpm-layout trees bundled with real esbuild at test time (UNLICENSED, GPL-2.0-only, `MIT AND GPL-2.0-only` fail; `MIT OR GPL-3.0`, `GPL-2.0-only OR MIT` pass; byte-identical reruns). The sample extension bundles only our `@vsslicer/example`, so its notices file says no third-party packages are bundled; the generator on a fixture with a real dependency lists it with licence text. `run.mjs ci` fails only in `test-webview` (another worker's module).

Decisions: see `.reference/notes/PLT-12-third-party-notices.md` (allow-list sources, `SEE LICENSE IN` and missing licence files fail).

Files: vsslicer/modules/tooling/{bin/spdx.mjs,bin/third-party-notices.mjs,bin/vsslicer-bundle.mjs,test/notices.test.mjs,package.json,CHANGELOG.md}; vsslicer/modules/example-extension/{package.json,pnpm-lock.yaml,CHANGELOG.md,.prettierignore,THIRD-PARTY-NOTICES.md}; CONTRIBUTING.md (section "Third-party notices"); .reference/notes/PLT-12-third-party-notices.md.
