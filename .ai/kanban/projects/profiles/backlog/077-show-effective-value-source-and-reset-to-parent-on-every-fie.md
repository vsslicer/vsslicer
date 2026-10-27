---
id: 77
title: "Show effective value, source and reset-to-parent on every field"
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US30
milestone: "VSS:M2"
sprint: "VSS:SP18"
depends_on: [75, 73, 140]
created: 2026-10-25
---

Each field shows where its value comes from (own, parent name, override block) and offers reset to parent.

**Code:** `vsslicer/modules/apps/profiles/webview/fields/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Editing a field writes only that key to the entity file; 'reset to parent' removes the key (end-to-end with the real store)
- [ ] Inherited and overridden values look different and the source text names the parent entity
- [ ] Stale entity version on save shows a banner offering reload (forced conflict test)

## Tasks

- [ ] Provenance label
- [ ] Reset action
- [ ] End-to-end test

## Progress

Not started.
