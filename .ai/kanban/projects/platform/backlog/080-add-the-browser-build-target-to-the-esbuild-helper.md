---
id: 80
title: Add the browser build target to the esbuild helper
type: feature
priority: P2
effort: M
model: sonnet
area: [web]
story: US50
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [3, 14]
created: 2026-10-25
---

Builds a module's `browser` entry as a web-extension-host bundle (`platform: browser`, `vscode` external, no Node shims) next to the existing `main` bundle, from a `browser` field in the module's `package.json`.

**Code:** `vsslicer/modules/tooling/tooling/src/build/...` (module: `tooling`, layer: `adapters`)

## Acceptance criteria

- [ ] The sample extension builds both `main` and `browser` bundles; the `main` bundle is byte-identical to before the change
- [ ] A module without a `browser` field builds exactly as before
- [ ] The browser bundle activates in the web extension host (smoke test through the harness card)

## Tasks

- [ ] Entry resolution
- [ ] Browser profile
- [ ] Tests on the sample extension

## Progress

Not started.
