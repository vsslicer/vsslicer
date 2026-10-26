---
id: 64
title: Load adapters by module path from registered descriptors
type: feature
priority: P1
effort: M
model: opus
area: [daemon]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP18"
depends_on: [62, 14]
created: 2026-10-25
---

Import an adapter module from another extension's folder, check its declared id and version against the descriptor, and refuse a mismatch.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] Loads the fixture adapter and `printer-bambu` by path; a descriptor/module mismatch or a throwing import gives a typed `AdapterError`, not an agent crash
- [ ] The trust model (same as the extension host) is documented in the module README

## Tasks

- [ ] Loader
- [ ] Version pinning
- [ ] Tests with a fixture adapter and a broken one

## Progress

Not started.
