---
id: 130
title: Download Cura resources from upstream when Cura is not installed
type: feature
priority: P1
effort: S
model: sonnet
area: [importers]
story: US17
milestone: "VSS:M2"
sprint: "VSS:SP9"
depends_on: [121, 135]
created: 2026-10-25
---

Fetches Cura definitions and quality resources at the pinned commit when the user has no Cura installed.

**Code:** `vsslicer/modules/profiles-cura/src/adapters/download/` (module: `profiles-cura`, layer: `adapters`)

## Acceptance criteria

- [ ] Fetch at Cura@5bea2f8 into a given folder with `source.commit` recorded; a network failure leaves no partial folder and returns a retryable error
- [ ] Network tests skip with a reason offline and run in CI with a cache outside the repository

## Tasks

- [ ] Write the fetch
- [ ] Atomic placement
- [ ] Tests

## Progress

Not started.

**Dependency on PRF-23 removed at SP9 (sp9-coordinator, D21):** that card moved to M7 (owner-gated). This card's tests use synthetic or local `.reference` inputs and skip with a reason when those are absent; the owner-gated check lands with PRF-23.
