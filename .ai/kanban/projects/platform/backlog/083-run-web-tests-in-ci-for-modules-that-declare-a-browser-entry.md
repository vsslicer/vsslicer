---
id: 83
title: Run web tests in CI for modules that declare a browser entry
type: chore
priority: P2
effort: S
model: sonnet
area: [web]
story: US51
milestone: "VSS:M5"
sprint: "VSS:SP36"
depends_on: [82, 9]
created: 2026-10-25
---

Extends the module-selection step of the CI workflow: for a changed module (or a module whose dependency changed) with a `browser` field, run `test:web` in Chromium on Linux.

**Code:** `.github/workflows/ and vsslicer/scripts/` (module: `tooling`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] A change to a fixture module with a `browser` entry runs its web job; a change to a module without one does not (selection output asserted on fixture changes)
- [ ] The job is part of the required `ci` check and uploads logs on failure

## Tasks

- [ ] Selection rule
- [ ] Job
- [ ] Fixture test

## Progress

Not started.
