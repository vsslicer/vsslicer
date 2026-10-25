---
id: 67
title: "Spike: choose the CBOR decoder"
type: spike
priority: P2
effort: S
model: opus
area: [tags]
story: US32
milestone: "VSS:M4"
sprint: "VSS:SP18"
depends_on: [14]
created: 2026-10-25
---

Pick a maintained MIT CBOR decoder that handles integer keys, bounds nesting and size, and preserves unknown keys; check bundle size and its licence.

**Code:** `vsslicer/modules/filament/docs/` (module: `filament`, layer: `n/a (spike)`)

## Acceptance criteria

- [ ] A note comparing at least two candidates against a small hostile-input corpus with the chosen decoder and its licence
- [ ] The decoder runs inside a plain Node worker and the extension host (no native module)

## Tasks

- [ ] Shortlist
- [ ] Run the corpus
- [ ] Record the choice

## Progress

Not started.
