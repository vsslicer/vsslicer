---
id: 167
title: Read plate flags and settings from Bambu and Orca projects
type: feature
priority: P1
effort: S
model: sonnet
area: [plates, 3mf]
story: US52
milestone: "VSS:M4"
depends_on: [166, 23]
created: 2026-10-25
---

Reads name, lock, bed type, print sequence, spiral mode and filament maps into the plate fields.

**Code:** `vsslicer/modules/3mf/src/adapters/bambu/` (module: `3mf`, layer: `adapters`)

## Acceptance criteria

- [ ] The Bambu and Orca fixtures give the golden values
- [ ] Missing keys give the defaults

## Tasks

- [ ] Reader
- [ ] Golden checks

## Progress

Not started.
