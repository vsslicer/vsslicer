---
id: 262
title: Fall back to the embedded engine when no engine is installed
type: feature
priority: P2
effort: S
model: sonnet
area: [embedded, engine]
story: US72
milestone: "VSS:M5"
sprint: "VSS:SP51"
depends_on: [102, 261]
created: 2026-10-25
---

Registers `slicer-embedded` and selects it only when detection finds no other engine and the setting allows it; the slice report says that the embedded engine was used.

**Code:** `vsslicer/modules/apps/slicer/src/application/...` (module: `slicer-extension`, layer: `application`)

## Acceptance criteria

- [ ] With no installed engine and the setting on, `Slicer.slice` uses the embedded engine and the report names it
- [ ] With the setting off, the existing "engine not found, download?" flow of the extension runs instead
- [ ] An installed engine always wins over the embedded one

## Tasks

- [ ] Registry entry
- [ ] Fallback rule
- [ ] Tests

## Progress

Not started.
