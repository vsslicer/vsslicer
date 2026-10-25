---
id: 237
title: Slice with the 3.0 CLI behind a setting
type: feature
priority: P3
effort: M
model: sonnet
area: [prusa]
story: US69
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [236, 227, 228]
created: 2026-10-25
---

Selects the 3.0 argv and config path when the setting is on and applies the same output verification, which already treats exit 0 as untrusted.

**Code:** `vsslicer/modules/slicer-prusa/src/adapters/...` (module: `slicer-prusa`, layer: `adapters`)

## Acceptance criteria

- [ ] With a stub 3.0 binary, the exit-0-with-error case ends in the typed error (recorded stderr)
- [ ] With the setting off, the 2.9.x path runs unchanged (test)
- [ ] A real 3.0 build slices the cube locally when available; otherwise the test is skipped with the reason

## Tasks

- [ ] Switch
- [ ] Stub tests
- [ ] Optional live test

## Progress

Not started.
