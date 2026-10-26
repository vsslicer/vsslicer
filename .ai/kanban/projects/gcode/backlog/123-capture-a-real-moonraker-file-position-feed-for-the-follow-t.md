---
id: 123
title: Capture a real Moonraker file_position feed for the follow tests
type: chore
priority: P3
effort: S
model: sonnet
area: [live]
depends_on: [53]
created: 2026-10-26
---

Replace GCP-53's synthetic Moonraker feed with one captured from a real Klipper printer, once one is available.

**Code:** `vsslicer/modules/gcode-preview/test/fixtures/feeds/` (module: `gcode-preview`, layer: n/a (fixture))

## Acceptance criteria

- [ ] A `notify_status_update` stream with `virtual_sdcard.file_position` captured from a Klipper printer printing a fixture G-code file, with firmware and Moonraker versions in PROVENANCE.md
- [ ] GCP-53's follow tests pass on it

## Progress

Not started. Needs a Klipper printer (owner hardware).
