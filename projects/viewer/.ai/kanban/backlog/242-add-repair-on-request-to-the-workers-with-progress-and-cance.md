---
id: 242
title: Add repair on request to the workers with progress and cancel
type: feature
priority: P1
effort: S
model: sonnet
area: [mesh, repair]
story: US64
milestone: "VSS:M4"
depends_on: [241, 235]
created: 2026-10-25
---

Adds `repair` to both worker adapters.

**Code:** `vsslicer/modules/mesh/src/adapters/workers/` (module: `mesh`, layer: `adapters`)

## Acceptance criteria

- [ ] Progress reaches 100 on the fixtures
- [ ] Cancel mid-repair returns the original mesh
- [ ] The host thread is not blocked

## Tasks

- [ ] Messages
- [ ] Tests

## Progress

Not started.
