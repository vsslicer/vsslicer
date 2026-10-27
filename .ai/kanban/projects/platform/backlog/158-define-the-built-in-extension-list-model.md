---
id: 158
title: Define the built-in extension list model
type: feature
priority: P2
effort: S
model: sonnet
area: [fork]
story: US67
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [148]
created: 2026-10-25
---

The `builtInExtensions` entries (id, version, repository, `sha256`) as a typed list read from one file; every shipped extension appears exactly once.

**Code:** `vsslicer/modules/tooling/vsslicer-build/src/domain/builtins.ts` (module: `vsslicer-build`, layer: `domain`)

## Acceptance criteria

- [ ] The list file holds the eight bundled extensions and `vsslicer.themes`; a test fails on duplicates, a missing `sha256` or a non-semver version
- [ ] `builtInExtensions` output matches the overlay schema from PLT-148

## Tasks

- [ ] Define the type and the list file
- [ ] Write the validation tests

## Progress

Not started.
