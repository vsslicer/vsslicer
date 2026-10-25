---
id: 65
title: "Compute completions per template kind, dialect and cursor context"
type: feature
priority: P2
effort: M
model: sonnet
area: [language]
story: US40
milestone: "VSS:M5"
sprint: "VSS:SP26"
depends_on: [61, 62, 63, 64]
created: 2026-10-25
---

Given text, an offset, a slicer and a template kind, returns completions: inside `[` and `{` the kind's placeholders first, then option variables; after a name with a vector option the index form; `if`/`elsif`/`endif` keywords at the start of `{`.

**Code:** `vsslicer/modules/gcode-templates/src/application/...` (module: `gcode-templates`, layer: `application`)

## Acceptance criteria

- [ ] For every (kind, placeholder) pair in both catalogues, completion at a fresh `[` in that kind offers the placeholder, and in a kind that does not provide it offers it only as an option variable if it is one (generated test over the whole catalogue)
- [ ] Cursor contexts (inside brackets, after `if`, in plain G-code) are unit-tested; plain G-code positions return nothing from this library
- [ ] Completion over a 10 000-line template answers within 50 ms

## Tasks

- [ ] Context detection
- [ ] Ranking
- [ ] Catalogue-wide test

## Progress

Not started.
