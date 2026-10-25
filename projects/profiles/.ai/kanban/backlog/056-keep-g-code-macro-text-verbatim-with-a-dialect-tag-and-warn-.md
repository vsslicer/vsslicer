---
id: 56
title: Keep G-code macro text verbatim with a dialect tag and warn on cross-dialect export
type: feature
priority: P1
effort: S
model: sonnet
area: [export]
story: US24
milestone: "VSS:M2"
sprint: "VSS:SP8"
depends_on: [55, 135]
created: 2026-10-25
---

Start, end, layer and toolchange G-code survive store, resolve and export unchanged; exporting to the other dialect warns because the languages are not portable.

**Code:** `vsslicer/modules/profiles/src/application/export/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] Start/end/layer/toolchange G-code from the Prusa, Orca and Cura fixtures round-trips byte-exact through store, resolve and export
- [ ] Exporting a `prusa-macro` text to Cura (or `cura-subst` to Prusa/Orca) returns a warning diagnostic naming the key and both dialects

## Tasks

- [ ] Add the dialect tag handling
- [ ] Warning rule
- [ ] Tests

## Progress

Not started.
