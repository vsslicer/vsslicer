---
id: 20
title: Implement readProject and the dialect dispatch
type: feature
priority: P0
effort: S
model: sonnet
area: [3mf]
story: US7
milestone: "VSS:M2"
sprint: "VSS:SP10"
depends_on: [13, 17]
created: 2026-10-25
---

Detects the dialect and dispatches to its reader; any reader that fails or is disabled falls back to core model plus preserved parts.

**Code:** `vsslicer/modules/3mf/src/application/readProject.ts` (module: `3mf`, layer: `application`)

## Acceptance criteria

- [ ] `readProject(pkg)` returns a `Project` with `dialect` for every fixture
- [ ] A disabled or failing dialect reader falls back to core plus preserved parts and says so in `Project.notices`
- [ ] Unknown parts stay in the Project untouched

## Tasks

- [ ] Dispatcher
- [ ] Fallback and notices
- [ ] Tests

## Progress

Not started.
