---
id: 2
title: Scaffold the pnpm workspace and Turborepo task graph
type: feature
priority: P0
effort: M
model: sonnet
area: [monorepo]
story: US1
milestone: "VSS:M1"
sprint: "VSS:SP2"
owner: PLT-2-worker
created: 2026-10-25
---

The layout every other board builds in: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.gitignore`, and the folders `packages/ extensions/ apps/ fixtures/ tools/`.

## Acceptance criteria

- [x] `pnpm install --frozen-lockfile && pnpm turbo run lint build test` passes from a clean clone with one sample library and one sample extension
- [x] `turbo.json` defines `lint`, `build` (after `^build`), `test` (after `build`), `test:integration`, `test:snapshot`, `package`
- [x] Deleting `turbo.json` leaves `pnpm -r run build` working (checked in a script)
- [x] `.nvmrc` pins the Node line of VS Code's Electron (24.x at `vscode@4ef6bab7`)
- [x] `engines` and `packageManager` fields are set

## Tasks

- [x] Create root files and folders
- [x] Add a sample library `@vsslicer/example` and a sample extension
- [x] Wire the task graph and local cache settings
- [x] Verify the plain `pnpm -r` fallback

## Progress

Done. "Repository root" read as `vsslicer/`. Verified in `vsslicer/`: `pnpm install --frozen-lockfile && pnpm turbo run lint build test` passes (5 tasks, second run fully cached); `tools/check-no-turbo.sh` copies the workspace without `turbo.json` to a temp dir and `pnpm -r run build` succeeds.

- `.nvmrc` pins 24; installed Node is 26, so `engines.node` is `>=24` (accepts both). `packageManager` is `pnpm@11.22.0` (installed), `engines.pnpm` `>=11`.
- Sample library `@vsslicer/example` (`src/domain/greeting.js`, `node --test`) and extension `vsslicer-example` (`src/extension.js`, presentation layer calling the library). Plain CommonJS JS; lint is `node --check` and build copies `src` to `dist` (`tools/copy-src.mjs`) as placeholders until PLT-3 (TypeScript) and PLT-4 (lint) replace them. Extension has no test script yet (needs a vscode stub or PLT-8).
- Not done: `test:integration`, `test:snapshot`, `package` are defined in turbo.json but no package has those scripts yet.

Files (under `vsslicer/`): package.json, pnpm-workspace.yaml, pnpm-lock.yaml, turbo.json, .nvmrc, .gitignore, apps/.gitkeep, fixtures/.gitkeep, packages/.gitkeep, packages/example/{package.json,src/index.js,src/domain/greeting.js,test/greeting.test.js}, extensions/example/{package.json,src/extension.js}, tools/{package.json,copy-src.mjs,check-no-turbo.sh}.
