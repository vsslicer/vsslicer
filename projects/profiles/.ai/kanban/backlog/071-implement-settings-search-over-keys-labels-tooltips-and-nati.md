---
id: 71
title: "Implement settings search over keys, labels, tooltips and native names"
type: feature
priority: P1
effort: M
model: sonnet
area: [form]
story: US31
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [135, 118]
created: 2026-10-25
---

A pure search index so `perimeters`, `wall_loops` and `wall_line_count` find the same field.

**Code:** `vsslicer/modules/profiles/src/application/form-model/search/` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] `perimeters` (Prusa), `wall_loops` (Orca) and `wall_line_count` (Cura) return the same field first
- [ ] A word from a tooltip finds its key; results rank key and label hits above tooltip hits
- [ ] Searching all ~800 keys takes under 20 ms (timing test)

## Tasks

- [ ] Build the index
- [ ] Ranking
- [ ] Tests

## Progress

Not started.
