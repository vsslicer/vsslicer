---
id: 111
title: "Spike: a serverless /extensionquery adapter over index.json (later option)"
type: spike
priority: P3
effort: M
model: opus
area: [registry]
story: US72
created: 2026-10-25
---

Parked (D24 item 4). VS Code's gallery POSTs to `${serviceUrl}/extensionquery` (`vscode@07f806f:src/vs/platform/extensionManagement/common/extensionGalleryManifestService.ts:46`), which GitHub Pages can't serve. A small serverless function (a Cloudflare Worker, for example) could answer gallery queries from `index.json`, making the marketplace usable as a regular VS Code/VSCodium gallery. Plan this only if the owner wants the stock Extensions view or open-vsx.org fall-through back.

**Code:** `docs/extensionquery-spike.md` (repo: `vsslicer/vsslicer-marketplace`, layer: n/a (spike))

## Acceptance criteria

- [ ] The spike lists the gallery endpoints and request shapes VSCodium uses, with `vscode@<commit>:path:line`
- [ ] It says what a Worker needs (routes, caching, costs, free-tier limits) and recommends do or don't

## Tasks

- [ ] Read the gallery service
- [ ] Write the spike

## Progress

Not started.
