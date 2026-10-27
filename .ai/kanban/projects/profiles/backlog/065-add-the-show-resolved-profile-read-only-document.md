---
id: 65
title: "Add the 'Show resolved profile' read-only document"
type: feature
priority: P0
effort: M
model: sonnet
area: [store]
story: US27
milestone: "VSS:M3"
sprint: "VSS:SP13"
depends_on: [59, 140]
created: 2026-10-25
---

A virtual document listing every resolved key with its provenance.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/commands/resolved/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Output equals `ProfileStore.resolve` for the E13 tuple fixtures, including the provenance column
- [ ] The document is read-only and refreshes on store change

## Tasks

- [ ] Write the content provider
- [ ] Format the provenance
- [ ] Integration test

## Progress

Not started.
