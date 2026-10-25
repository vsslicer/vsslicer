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
created: 2026-10-25
---

The layout every other board builds in: root `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.gitignore`, and the folders `packages/ extensions/ apps/ fixtures/ tools/`.

## Acceptance criteria

- [ ] `pnpm install --frozen-lockfile && pnpm turbo run lint build test` passes from a clean clone with one sample library and one sample extension
- [ ] `turbo.json` defines `lint`, `build` (after `^build`), `test` (after `build`), `test:integration`, `test:snapshot`, `package`
- [ ] Deleting `turbo.json` leaves `pnpm -r run build` working (checked in a script)
- [ ] `.nvmrc` pins the Node line of VS Code's Electron (24.x at `vscode@4ef6bab7`)
- [ ] `engines` and `packageManager` fields are set

## Tasks

- [ ] Create root files and folders
- [ ] Add a sample library `@vsslicer/example` and a sample extension
- [ ] Wire the task graph and local cache settings
- [ ] Verify the plain `pnpm -r` fallback

## Progress

Not started.
