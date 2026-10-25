---
id: 67
title: Write the pinned Cura release manifest
type: chore
priority: P1
effort: S
model: sonnet
area: [cura]
story: US15
milestone: "VSS:M3"
depends_on: [7, 66]
created: 2026-10-25
---

Manifest entries for the pinned Cura release (AppImage, DMG, Windows installer) with SHA-256, validated against the `slicer-api` schema. CuraEngine has no standalone release.

**Code:** `vsslicer/modules/slicer-cura/src/domain/...` (module: `slicer-cura`, layer: `domain`)

## Acceptance criteria

- [ ] Manifest validates; a test fails if any OS lacks a SHA-256
- [ ] Check script re-downloads and compares hashes

## Tasks

- [ ] Fill manifest
- [ ] Validation test

## Progress

Not started.
