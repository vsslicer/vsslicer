---
id: 254
title: Check the provenance file of every distributed engine file
type: chore
priority: P2
effort: S
model: sonnet
area: [embedded]
story: US74
milestone: "VSS:M5"
sprint: "VSS:SP48"
depends_on: [253, PLT-11, PLT-13]
created: 2026-10-25
---

A CI check fails when a shipped binary or WASM file has no entry with source revision and build recipe in the provenance file.

**Code:** `vsslicer/modules/slicer-embedded/` (module: `slicer-embedded`, layer: n/a (ci))

## Acceptance criteria

- [ ] A packaged VSIX with an unlisted file fails the check (test with a dummy file)
- [ ] The provenance file lists revision, recipe URL and licence for each file
- [ ] The licence check (PLT-11) covers the engine's licence

## Tasks

- [ ] Provenance format
- [ ] CI check
- [ ] Negative test

## Progress

Not started.
