---
id: 68
title: "Write tag normalisation, formats and clone detection"
type: feature
priority: P2
effort: S
model: sonnet
area: [tags]
story: US31
milestone: "VSS:M4"
sprint: "VSS:SP23"
depends_on: [46]
created: 2026-10-25
---

Many tags per spool, UID normalisation (case, separators), all-zero UID means untagged, `format` from Spoolman's known-format list, and detection of one tag on two spools.

**Code:** `vsslicer/modules/filament/src/domain/...` (module: `filament`, layer: `domain`)

## Acceptance criteria

- [ ] Normalisation table tests; an all-zero UID is `untagged`
- [ ] The same UID on two spools returns a `clone` result and merges nothing

## Tasks

- [ ] Write the rules
- [ ] Tests

## Progress

Not started.
