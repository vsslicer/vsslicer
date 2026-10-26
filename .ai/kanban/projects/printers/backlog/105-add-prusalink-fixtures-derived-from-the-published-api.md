---
id: 105
title: Add PrusaLink fixtures derived from the published API
type: chore
priority: P0
effort: M
model: sonnet
area: [prusalink]
story: US21
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [104, PLT-13, 84]
created: 2026-10-25
---

Recorded or derived v1 and legacy sessions for the nine states, upload with and without `Print-After-Upload`, Digest challenge and key fallback.

**Code:** `vsslicer/modules/printer-prusalink/test/fixtures/` (module: `printer-prusalink`, layer: `n/a (fixtures)`)

## Acceptance criteria

- [ ] The PrusaLink `openapi.yaml` is not vendored; types are re-derived and PROVENANCE says so
- [ ] Sessions replay in the harness

## Tasks

- [ ] Derive sessions
- [ ] PROVENANCE

## Progress

Not started.
