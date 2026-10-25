---
id: 154
title: Detect and stage a newer PrusaSlicer vendor version
type: feature
priority: P2
effort: M
model: sonnet
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [149, 40]
created: 2026-10-25
---

Implements `UpdateSource` for Prusa vendors two ways: a newer commit of the upstream vendor repository (D4), or the `.idx` index versions in `vendor_indices.zip` listed by `ArchiveRepositoryManifest.json` at `preset-repo-api.prusa3d.com`. `stage` reuses the pinned-commit downloader.

**Code:** `vsslicer/modules/profiles-prusa/src/adapters/...` (module: `profiles-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] Recorded index and commit-list responses give the newer version, `null` when equal, and pick the newest version compatible with the running format (as `PresetUpdater.cpp:302-460` does)
- [ ] `stage` fetches `<vendor>/<version>.ini` or the commit's bundle into the given folder only
- [ ] A manifest pointing at localhost (as `RepositoryManifest.json` does in 3.0) is ignored with a diagnostic

## Tasks

- [ ] Index reader
- [ ] Commit check
- [ ] Stage
- [ ] Tests

## Progress

Not started.
