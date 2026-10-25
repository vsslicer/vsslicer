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

- [ ] Entry points resolve from a consumer in `extensions/` and bundle with esbuild
- [ ] Types for each entry exported; `host` imports nothing browser-only and `webview` nothing from `vscode`
- [ ] Package builds in Turborepo

## Tasks

- [ ] Create package and exports map
- [ ] Add per-entry tsconfig
- [ ] Add a smoke test per entry

## Progress

Not started.
