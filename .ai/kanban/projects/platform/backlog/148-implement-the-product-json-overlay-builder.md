---
id: 148
title: Implement the `product.json` overlay builder
type: feature
priority: P2
effort: M
model: sonnet
area: [fork]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [127]
created: 2026-10-25
---

A pure function merges our branding and gallery fields over VSCodium's `product.json` and validates the result, so the field list is tested rather than patched by hand.

**Code:** `vsslicer/modules/vsslicer-build/src/domain/product.ts` (module: `vsslicer-build`, layer: `domain`)

## Acceptance criteria

- [ ] `buildProduct(base, overrides)` sets `nameShort`, `nameLong`, `applicationName`, `dataFolderName`, `urlProtocol`, `darwinBundleIdentifier`, `win32*AppId`, `extensionsGallery`, `controlUrl`, `builtInExtensions`, `updateUrl`
- [ ] Unit tests: a missing required field, a Microsoft-owned id or marketplace URL, and `extensionEnabledApiProposals` without a recorded justification each fail with a named error
- [ ] Output is key-sorted and deterministic

## Tasks

- [ ] Define the override schema
- [ ] Write the builder and tests

## Progress

Not started.
