---
id: 5
title: "Define engine discovery, install and the pinned-release manifest schema"
type: feature
priority: P0
effort: S
model: sonnet
area: [engine]
story: US2
milestone: "VSS:M3"
depends_on: [2]
created: 2026-10-25
---

Types shared by every adapter that detects or downloads an engine: `EngineInstall {id, version, path, source}`, `EngineLocator`, `EngineProvisioner`, and a JSON Schema for the pinned-release manifest (version, per-OS URL, size, SHA-256).

**Code:** `vsslicer/modules/slicer-api/src/domain/...` (module: `slicer-api`, layer: `domain`)

## Acceptance criteria

- [ ] A manifest missing a SHA-256 for any OS fails schema validation (test)
- [ ] `EngineInstall.source` is one of `user-setting | detected | downloaded`
- [ ] Types and schema are exported and documented

## Tasks

- [ ] Types
- [ ] Manifest JSON Schema and validator
- [ ] Tests

## Progress

Not started.
