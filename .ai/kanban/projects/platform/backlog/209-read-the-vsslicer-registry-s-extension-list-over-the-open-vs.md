---
id: 209
title: Read the VSSlicer marketplace index.json
type: feature
priority: P0
effort: M
model: sonnet
area: [fork, registry]
story: US71
milestone: "VSS:M6"
sprint: "VSS:SP15"
depends_on: [206, 222]
created: 2026-10-27
---

The adapter behind the VSSlicer extensions view (D24): it reads the static `index.json` that `vsslicer/vsslicer-marketplace` publishes on GitHub Pages (PLT-222, PLT-126). No gallery API, no open-vsx.org, no Microsoft Marketplace. The index is untrusted input; bounds are named here (estimation rule 25).

**Code:** `vsslicer/modules/apps/workbench/src/adapters/marketplace-index.ts` and the `ExtensionCatalogue` port in `src/application/` (module: `workbench-extension`, layer: `adapters`)

## Acceptance criteria

- [ ] `list()`, `get(id)` and `download(version)` against the URL from `vsslicer.workbench.marketplaceUrl` (default: the Pages URL); the index is validated against the schema from PLT-222 (a copy pinned by version)
- [ ] `download` checks the VSIX `sha256` from the index and refuses a mismatch with a typed error
- [ ] An index over 5 MB, more than 500 entries, or a VSIX over 200 MB is refused with a typed error; timeouts are typed errors too
- [ ] Only the `vsslicer` namespace is returned; entries contributing `mcpServerDefinitionProviders` are dropped
- [ ] Tests against a fixture index; no request to any other host (checked by the test's fetch stub)

## Tasks

- [ ] Port and adapter
- [ ] Bounds and checksum
- [ ] Tests

## Progress

Not started.
