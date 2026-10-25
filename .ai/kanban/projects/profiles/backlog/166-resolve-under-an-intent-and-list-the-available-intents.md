---
id: 166
title: Resolve under an intent and list the available intents
type: feature
priority: P2
effort: M
model: sonnet
area: [store]
story: US61
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [149, 144]
created: 2026-10-25
---

`resolve` takes an optional intent and applies the matching override blocks after the quality and before user changes, recording them in the provenance; `listIntents(printer, material[], process)` returns the categories that match.

**Code:** `vsslicer/modules/profiles/src/application/...` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] For a Cura-shaped tuple fixture with intents, resolving with `strong` changes exactly the keys the block sets and provenance names the block; without an intent the result is identical to before
- [ ] `listIntents` always includes the default and only the categories whose condition matches
- [ ] The result carries `intent` for downstream modules

## Tasks

- [ ] Resolve change
- [ ] listIntents
- [ ] Tests

## Progress

Not started.
