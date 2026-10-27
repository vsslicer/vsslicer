---
id: 148
title: Implement the `product.json` overlay builder
type: feature
priority: P0
effort: M
model: sonnet
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [127]
created: 2026-10-25
---

A pure function merges our branding and build fields over VSCodium's `product.json` and validates the result, so the field list is tested rather than patched by hand. VSCodium merges its own overlay last with `jq -s '.[0] * .[1]'` (`vscodium@be70704:prepare_vscode.sh:126`); ours runs after it. Research: `docs/research/vscodium-build.md` §1, §5, §6.

**Code:** `src/domain/product.ts` (repo: `vsslicer/vsslicer-build`, layer: `domain`)

## Acceptance criteria

- [ ] `buildProduct(base, overrides)` sets `nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `urlProtocol`, `darwinBundleIdentifier`, `win32*AppId`, `builtInExtensions`, `updateUrl` and our `vsslicer.removedViewContainers` list
- [ ] It removes `extensionsGallery` and `mcpGallery` (D24): the output has neither, and a test fails if an override sets one
- [ ] Unit tests: a missing required field, a Microsoft-owned id or marketplace URL, and `extensionEnabledApiProposals` without a recorded justification each fail with a named error
- [ ] Output is key-sorted and deterministic

## Tasks

- [ ] Define the override schema
- [ ] Write the builder and tests

## Progress

Not started.
