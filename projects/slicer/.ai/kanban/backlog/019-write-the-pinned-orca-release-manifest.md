---
id: 19
title: Write the pinned Orca release manifest
type: chore
priority: P0
effort: S
model: sonnet
area: [orca, engine]
story: US2
milestone: "VSS:M3"
depends_on: [7, 16, 17]
created: 2026-10-25
---

The manifest of pinned Orca releases with per-OS URL, size and SHA-256, validated against the schema from `slicer-api`.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] `data/engine-manifest.json` validates against the schema; a test fails if any OS has no SHA-256
- [ ] A check script re-downloads each URL and compares the SHA-256 (run on demand)
- [ ] The pinned versions equal those chosen by the spike

## Tasks

- [ ] Fill the manifest
- [ ] Validation test
- [ ] Check script

## Progress

Not started.
