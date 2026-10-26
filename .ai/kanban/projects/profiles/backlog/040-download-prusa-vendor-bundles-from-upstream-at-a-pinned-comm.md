---
id: 40
title: Download Prusa vendor bundles from upstream at a pinned commit
type: feature
priority: P0
effort: M
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [119, 135]
created: 2026-10-25
---

Fetches PrusaSlicer-settings-prusa-fff and -non-prusa-fff bundles at a pinned commit into a target folder and records `source.commit` (D4). Cura resources are a separate card in `profiles-cura`.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/download/` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] The downloader writes only into the folder it is given and records `source.commit` and the URL on the vendor entity
- [ ] A network failure mid-download leaves no partial bundle (temp folder and rename) and returns a retryable error
- [ ] Tests needing the network skip with a reason offline and run in CI with a cache outside the repository
- [ ] No Prusa data is in the repository or in the module's published file list (test)

## Tasks

- [ ] Write the pinned-commit fetch
- [ ] Write atomic placement
- [ ] Tests

## Progress

Not started.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.
