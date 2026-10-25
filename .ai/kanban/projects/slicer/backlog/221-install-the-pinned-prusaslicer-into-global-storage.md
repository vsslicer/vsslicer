---
id: 221
title: Install the pinned PrusaSlicer into global storage
type: feature
priority: P2
effort: M
model: sonnet
area: [prusa]
story: US65
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [14, 219, 220]
created: 2026-10-25
---

Downloads the pinned release after confirmation, verifies SHA-256, extracts it into global storage with the runtime module and records the install.

**Code:** `vsslicer/modules/slicer-prusa/src/adapters/...` (module: `slicer-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] A hash mismatch, a network error and a disk-full error each end in their own typed error (stub server)
- [ ] Extraction rejects a path-traversal entry
- [ ] The installed binary is found by P5 and runs `--version`

## Tasks

- [ ] Download and verify
- [ ] Extract
- [ ] Register the install
- [ ] Tests

## Progress

Not started.
