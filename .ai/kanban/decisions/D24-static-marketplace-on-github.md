---
id: D24
title: "The VSSlicer marketplace is static: VSIX files on GitHub Releases, index.json on GitHub Pages, read by our own extensions view"
status: accepted
date: 2026-10-27
---

## Context

E68 planned a self-hosted Eclipse Open VSX server (PostgreSQL, OAuth, backups, signature archives,
upstream fall-through). It needs a server and a hosting budget (D5, D10), and 22 cards (PLT-110..131).
The owner has since created the public repo `vsslicer/vsslicer-marketplace` and wants the VSSlicer
build (E69) now, with an extensions view that lists only our marketplace and no MCP servers (D23).

VS Code's gallery protocol can't run on static hosting. Every query is a POST to
`${extensionsGallery.serviceUrl}/extensionquery`
(`vscode@07f806f:src/vs/platform/extensionManagement/common/extensionGalleryManifestService.ts:46`),
and GitHub Pages only serves GET. Our own extensions view doesn't need the gallery:
`workbench.extensions.installExtension` installs from a VSIX URI
(`vscode@07f806f:src/vs/workbench/contrib/extensions/browser/extensions.contribution.ts:438-446,523-524`).
Research: `docs/research/vscodium-build.md` §5.

## Decision (proposed)

1. **Storage.** Each VSSlicer extension release attaches its VSIX to a GitHub Release (in the
   monorepo now, in the extension's own repo after a split).
2. **Catalogue.** `vsslicer/vsslicer-marketplace` holds a generator that reads those releases and
   writes one `index.json`: per extension its id, versions, `engines.vscode`, `extensionDependencies`,
   licence expression, repository URL, VSIX URL and `sha256`. A workflow publishes it on GitHub Pages.
   The generator enforces the registry policy that E68 put on the server: a licence expression is
   required, a copyleft extension needs a source link, and only the `vsslicer` namespace is accepted.
   A Pages page carries the takedown procedure and contact.
3. **Client.** The VSSlicer extensions view (`apps/workbench`, PLT-209/210) reads `index.json`,
   checks `sha256`, installs in dependency order with `workbench.extensions.installExtension`, and
   offers updates. The VSSlicer build sets no `extensionsGallery` and no `mcpGallery`, so nothing
   talks to open-vsx.org or the Microsoft Marketplace.
4. **Later option, not planned.** A serverless `/extensionquery` adapter (for example a Cloudflare
   Worker that answers gallery queries from `index.json`) would make the marketplace usable as a
   regular VS Code/VSCodium gallery. It's parked as a spike (PLT-111) until someone wants the stock
   Extensions view or open-vsx.org fall-through back.

## Alternatives

- **Self-hosted Open VSX (E68 as written):** a full gallery with upstream fall-through, but a
  server, a database, OAuth and backups to run and pay for, which is blocked on D5.
- **Publish to open-vsx.org and point the build at it:** no hosting, but the owner wants the
  marketplace to list only our extensions, and publishing needs accounts (Q8: no marketplace
  accounts for now).
- **`coder/code-marketplace`:** a smaller server, but still a server.

## Consequences

- No running service and no hosting bill. GitHub Releases and Pages are free for public repos.
- No public catalogue in the VSSlicer build. Users who want other extensions install VSIX files by
  hand (`Extensions: Install from VSIX...` stays in the command palette) or use stock VS Code or
  VSCodium.
- No gallery features: ratings, search ranking and the extension-control list go. Our view does
  search, updates and dependency order itself.
- E68 is re-planned: PLT-110, 111 (now the parked adapter spike), 118, 121, 125, 126 and 129 rewritten;
  PLT-222 (`index.json` schema) and PLT-223 (generator) new. The Open VSX-only cards (PLT-112, 113, 114,
  115, 116, 117, 119, 120, 122, 123, 124, 130, 131 and E69's PLT-155) are parked: no sprint, no
  milestone, P3, a note. Delete them when convenient.
- PLT-209 reads `index.json` instead of the Open VSX API.
