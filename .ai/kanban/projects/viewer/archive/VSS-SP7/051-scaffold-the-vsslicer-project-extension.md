---
id: 51
title: Create the `project-extension` module
type: chore
priority: P0
effort: S
model: sonnet
area: [viewer]
story: US16
milestone: "VSS:M2"
sprint: "VSS:SP7"
owner: sp7-vwr-51
depends_on: [PLT-2, PLT-3, PLT-4, PLT-8, PLT-14, PLT-21]
created: 2026-10-25
---

Creates the `project-extension` module from the `tooling` module. It is the VS Code extension `vsslicer.project`.

**Code:** `vsslicer/modules/project-extension/` (module: `project-extension`, layer: n/a (scaffold))

## Acceptance criteria

- [x] `cd vsslicer/modules/project-extension && pnpm install && pnpm test && pnpm build` works alone inside the module
- [x] Folders `domain/`, `application/`, `adapters/`, `presentation/` exist as needed and the layer-boundary lint rule runs
- [x] `node scripts/run.mjs ci` picks the module up
- [x] Package name `@vsslicer/project-extension`, version 0.0.0, changelog and SPDX headers present
- [x] VSIX packages within the size budget

## Tasks

- [ ] Create from the tooling module
- [ ] Add the layer folders and a smoke test
- [ ] Check `run.mjs ci`

## Progress

Created `vsslicer/modules/project-extension` (copied example-extension config; own package.json 0.0.0, no runtime deps). Files: package.json, src/domain/about.ts, src/presentation/extension.ts, test/package.test.ts, test/integration/extension.test.ts, README, CHANGELOG, PROVENANCE, LICENSE, configs. Verified: `pnpm install && pnpm lint && pnpm test (1 pass) && pnpm build` OK; `pnpm package` VSIX 15.4 KB (budget 200 KB); `pnpm test:integration` in real VS Code passed (1 passing). run.mjs discovers modules by scanning modules/*/package.json, so it is picked up; full `run.mjs ci` not run (publishes). Not done: application/adapters folders (not needed yet).

### Coordinator: shared-file changes
None.

Review (sp7-rev-f): PASS. Ran in place and in a clean scratch copy: `pnpm install --frozen-lockfile && pnpm lint && pnpm test (1 pass) && pnpm build && pnpm package`: VSIX 15.4 KB (budget 200 KB), 8 entries (manifest, package.json, LICENSE, notices, readme, changelog, dist/extension.js). Configs (.vscodeignore, .prettierignore, eslint, tsconfig, pnpm-workspace, .npmrc) are identical to example-extension; package.json differs only in name/description/version/commands/build. Layers: `domain/about.ts` pure, `presentation/extension.ts` the only vscode import; a probe `src/domain/bad.ts` importing `vscode` and presentation fails the lint with both `no-restricted-imports` and `boundaries/dependencies` (probe removed). SPDX headers on all 4 source/test files; name `@vsslicer/project-extension` 0.0.0, CHANGELOG, PROVENANCE, LICENSE present. `project-extension-0.0.0.vsix`, `dist`, `node_modules` are git-ignored (`vsslicer/.gitignore` `*.vsix`, module `.gitignore` dist-test/test-results). run.mjs discovers modules by `modules/*/package.json`. Integration test not re-run (worker ran it). Docs fix in place (no behaviour): README now says the real extension id is `vsslicer.project-extension` (vsce gets the unscoped package name; manifest Identity `Id="project-extension" Publisher="vsslicer"`), not `vsslicer.project`. Note: cards that need the id (extensionDependencies, `getExtension`) must use `vsslicer.project-extension`, or a later card renames the package.
