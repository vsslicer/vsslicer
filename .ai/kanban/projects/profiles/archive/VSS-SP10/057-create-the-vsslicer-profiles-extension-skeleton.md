---
id: 57
title: Create the `profiles-extension` module (vsslicer.profiles)
type: chore
priority: P0
effort: S
model: sonnet
area: [store]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21, PLT-15]
created: 2026-10-25
---

Creates the independent `profiles-extension` module, the VS Code extension `vsslicer.profiles` and composition root that wires the `profiles` core to the ecosystem adapters.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/` and `vsslicer/modules/profiles-extension/package.json` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [x] `pnpm install && pnpm test && pnpm build` works alone inside `vsslicer/modules/profiles-extension` with nothing else built; `node scripts/run.mjs ci` picks it up
- [x] The extension activates on a workspace containing `.vsslicer/profiles/` or when its view is opened, in an `@vscode/test-electron` run on the minimum `engines.vscode`
- [ ] The VSIX packages and passes the PLT-21 content assertion; the PLT-4 layer-boundary lint passes (VS Code API only under `presentation`)
- [ ] `package.json` declares semver ranges on `@vsslicer/profiles` and the three adapter modules; it is the only module that does

## Tasks

- [x] Generate the module from the tooling template
- [x] Create the manifest and entry point
- [x] Add the activation test

## Progress

Module created from printers-extension (tooling ^0.8.4, extensionName `profiles`, extensionKind workspace, activation `workspaceContains:.vsslicer/profiles/` + onCommand `vsslicer.profiles.about`). Layers: domain + presentation (as the template; application/adapters added when they have code).
Verified: pnpm install, lint, build, test (1 pass), test:integration in real VS Code (1 passing), pnpm package (15.5 KB, id vsslicer.profiles), `run.mjs checks` pass.
Left open (not ticked): criterion 3 (PLT-21 content assertion not separately run; package step passed) and criterion 4: `@vsslicer/profiles` and the adapter modules are unpublished (E404 on the local registry), so no semver deps declared yet. No `onView` activation: no view contributed yet.

**Coordinator (SP10):** the semver dependencies on `@vsslicer/profiles` and the three importer modules are not declared here: none is published yet (PRF-137 to PRF-140 release them). The first card that imports one (PRF-59, hosting the store) adds its range; that criterion is carried there, not a defect of this skeleton.

**Review failed (sp10-rev-prf-57)**

Ran in `vsslicer/modules/profiles-extension`: `pnpm install --frozen-lockfile` (up to date), `pnpm lint` (eslint, prettier, tsc clean), `pnpm build`, `pnpm test` (1/1 pass), `node scripts/run.mjs checks` (exit 0; the module is auto-discovered from `modules/`, so `run.mjs ci` and the CI matrix pick it up). In a scratch copy: `pnpm package` (the PLT-21 assertion lives in tooling 0.8.4 `bin/vsslicer-package.mjs` `checkManifest`/`checkContent`): `profiles-0.0.0.vsix`, 15.5 KB of 200 KB, 8 entries (manifest files, package.json, LICENSE.txt, THIRD-PARTY-NOTICES.md, readme, changelog, `dist/extension.js`), vsixmanifest Identity `vsslicer.profiles`, no problems; VSIX deleted. `pnpm test:integration`: 1 passing on VS Code 1.100.0 (min) and on stable.

Probes: adding `!src/**` to `.vscodeignore` makes `pnpm package` fail with `content: unexpected extension/src/...` (assertion is live). Adding `import * as vscode from 'vscode'` to `src/domain/about.ts` fails the lint (`no-restricted-imports`, VS Code API only in `src/presentation`). Licence AGPL-3.0-or-later in `package.json`, `LICENSE`, SPDX headers; `files` and `.vscodeignore` identical to printers-extension; `prepack: pnpm build`; `extensionName: "profiles"` passes the tooling pattern. Criterion 4 not judged (moved to PRF-59).

Problems:

1. Criterion 2 is ticked but nothing tests activation on a workspace containing `.vsslicer/profiles/`. `test/integration/extension.test.ts:12` calls `ext.activate()` itself, and `@vsslicer/test-vscode` (`dist/run.js:42`, `launchArgs`) opens no workspace folder; the unit test (`test/package.test.ts:13`) pins only `onCommand:`. Probe: deleting the `workspaceContains:.vsslicer/profiles/` line from `package.json` leaves `pnpm test` (1 pass) and `pnpm test:integration` (1 passing on both versions) green. Rule: a ticked criterion needs a test that fails when its behaviour is removed. Expected fix, smallest first: (a) assert `activationEvents` includes `workspaceContains:.vsslicer/profiles/` in `test/package.test.ts`, which pins the manifest but not VS Code's behaviour; and for the real run, (b) open a fixture workspace with `.vsslicer/profiles/` in the integration run and assert `ext.isActive` before any `activate()` call. (b) needs a workspace option in `@vsslicer/test-vscode` (a platform card) unless the coordinator settles that (a) is enough for a skeleton and moves (b) to a follow-up.

Fixed in place (no behaviour change): `PROVENANCE.md` now says it was scaffolded from `printers-extension` (itself from `project-extension`).

**Fix for the review (sp10-prf-57-fix):** option (a), settled by the coordinator. `test/package.test.ts` gains "a workspace containing .vsslicer/profiles/ activates the extension", asserting `workspaceContains:.vsslicer/profiles/` is in `activationEvents`. It pins the manifest, not VS Code's behaviour; the real workspace-activation integration test (workspace option in `@vsslicer/test-vscode`) is a separate platform card filed by the coordinator.
Mutation probe: deleting the `workspaceContains` line from `package.json` makes `pnpm test` fail (1 pass, 1 fail); restored.
Verified: `pnpm lint`, `pnpm build` clean; `pnpm test` 2 pass, 0 fail; `node scripts/run.mjs checks` exit 0.

**Review passed (sp10-coordinator, re-review of the fix round)**: `pnpm lint` clean, `pnpm test` 2 pass 0 fail; probe: removing `workspaceContains:.vsslicer/profiles/` from package.json fails the new test (restored, `git diff` empty). The first review's other checks (VSIX assertion, integration suite on 1.100.0 and stable, layering) stand. Workspace-activation integration test: PLT-201 (SP11). Dependency ranges: PRF-59.
