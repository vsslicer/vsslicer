---
id: 221
title: "Drop the built-in extensions a printing editor doesn't need"
type: feature
priority: P0
effort: S
model: sonnet
area: [fork]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [149]
created: 2026-10-27
---

No patch needed. Bundled `extensions/*` are globbed at build time (`vscode@07f806f:build/lib/extensions.ts:418-427`), so deleting a folder drops the extension; VSCodium does the same with its JSON `remove` action (`vscodium@be70704:patches/52-ext-copilot-remove-it.json`). Microsoft's downloaded built-ins come from `product.json#builtInExtensions` (`vscode@07f806f:product.json:40-89`), which our overlay writes. Research: `docs/research/vscodium-build.md` §6.

**Code:** `patches/remove.json` and the `builtInExtensions` list in `overlay/product.json` (repo: `vsslicer/vsslicer-build`, layer: n/a (config))

## Acceptance criteria

- [ ] `remove.json` drops at least `git`, `git-base`, `github`, `github-authentication`, `debug-auto-launch`, `debug-server-ready`, `npm`, `grunt`, `gulp`, `jake`; each entry says why
- [ ] `builtInExtensions` holds only VSSlicer extensions (no `ms-vscode.js-debug`, no `js-debug-companion`)
- [ ] A script checks no remaining built-in names a removed one in `extensionDependencies`, and fails by name otherwise
- [ ] The built editor starts with no extension activation error in the log

## Tasks

- [ ] Removal list
- [ ] Dependency check script
- [ ] Start check
