---
id: 159
title: Bundle the VSSlicer extensions as built-in VSIX files with sha256
type: feature
priority: P0
effort: M
model: sonnet
area: [fork]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP16"
depends_on: [158, 206]
created: 2026-10-25
---

The build ships our extensions built in, through `product.json#builtInExtensions` entries with a local `vsix` path and its `sha256`, which VS Code's build already supports (`vscode@07f806f:build/lib/builtInExtensions.ts:18-31,85-86`; checksum at `build/lib/extensions.ts:255-267`). No patch. Starts with the extensions that have a VSIX today (at least `apps/workbench`, PLT-206); others join the list as they release. Research: `docs/research/vscodium-build.md` §1.

**Code:** `src/adapters/fetch-builtins.ts`, `builtins.json` (repo: `vsslicer/vsslicer-build`, layer: `adapters`)

## Acceptance criteria

- [ ] `builtins.json` lists each extension with version, VSIX URL (a GitHub Release asset, or the marketplace `index.json` once PLT-126 exists) and `sha256`
- [ ] The fetch step downloads each VSIX, refuses a checksum mismatch by name, and writes the `builtInExtensions` entries the overlay builder consumes
- [ ] A test with a corrupted VSIX fails by name
- [ ] Until the release workflow exists (PLT-25, M7), a VSIX built in this repo's CI from `vsslicer/` is accepted, with a note in `builtins.json`

## Tasks

- [ ] List and fetch
- [ ] Wire into the overlay
- [ ] Test

## Progress

Not started.
