---
id: 96
title: "Validate generic exports with lib3mf, the Consortium suite and three.js"
type: feature
priority: P1
effort: M
model: sonnet
area: [3mf]
story: US34
milestone: "VSS:M4"
sprint: "VSS:SP25"
depends_on: [95, 18, 19]
created: 2026-10-25
---

Runs the generic export of each fixture through the lib3mf WASM oracle, the Consortium positive cases and three.js `3MFLoader`.

**Code:** `vsslicer/modules/core/3mf/test/integration/generic/` (module: `3mf`, layer: n/a (integration tests))

## Acceptance criteria

- [ ] Object count and positions agree between lib3mf, three.js and our reader
- [ ] The Consortium positive-case checks pass
- [ ] Runs in CI

## Tasks

- [ ] Harness reuse
- [ ] Three.js loader check
- [ ] CI job

## Progress

Not started.
