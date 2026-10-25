---
id: 32
title: Add a non-blocking nightly job against the live OFD URL
type: chore
priority: P2
effort: S
model: sonnet
area: [import]
story: US7
milestone: "VSS:M4"
depends_on: [30]
created: 2026-10-25
---

Detect upstream format drift early without breaking builds.

**Code:** `vsslicer/.github/workflows/` entry for `filament-ofd` (module: `filament-ofd`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] A scheduled workflow downloads the live OFD bulk file, runs the importer and fails only its own job (never required for merge)
- [ ] A failure opens a visible report artefact listing the schema errors

## Tasks

- [ ] Write the workflow
- [ ] Record the report

## Progress

Not started.
