---
id: 30
title: "Create the webview-kit package with host, webview and gl entry points"
type: feature
priority: P0
effort: S
model: sonnet
area: [webview-kit]
story: US8
milestone: "VSS:M1"
sprint: "VSS:SP3"
depends_on: [3, 8]
created: 2026-10-25
---

`packages/webview-kit` with the three entry points (`host` node, `webview` and `gl` browser), the transport schema version constant and build.

## Acceptance criteria

- [x] Entry points resolve from a consumer in `extensions/` and bundle with esbuild
- [x] Types for each entry exported; `host` imports nothing browser-only and `webview` nothing from `vscode`
- [x] Package builds in Turborepo

## Tasks

- [x] Create package and exports map
- [x] Add per-entry tsconfig
- [x] Add a smoke test per entry

## Progress

Module `vsslicer/modules/webview-kit` (@vsslicer/webview-kit 0.1.0, published to the local registry). Exports `./host`, `./webview`, `./gl`, each re-exporting `TRANSPORT_SCHEMA_VERSION`; per-entry tsconfigs (DOM lib only for browser entries); test bundles each entry with esbuild from a scratch consumer and asserts no vscode input. "Builds in Turborepo" is met as `pnpm build` per module (no Turborepo).
