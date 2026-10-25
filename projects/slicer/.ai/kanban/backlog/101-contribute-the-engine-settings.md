---
id: 101
title: Contribute the engine settings
type: feature
priority: P0
effort: S
model: sonnet
area: [engine, tasks]
story: US6
milestone: "VSS:M3"
depends_on: [100]
created: 2026-10-25
---

Settings `vsslicer.slicer.engine`, `.orca.path`, `.cura.path`, `.timeout`, and the output folder default `.vsslicer/sliced`.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Settings appear with descriptions, defaults and machine/window scope as appropriate
- [ ] A test reads each setting through a thin config adapter
- [ ] Invalid values (negative timeout) are reported once

## Tasks

- [ ] package.json contributions
- [ ] Config adapter
- [ ] Tests

## Progress

Not started.
