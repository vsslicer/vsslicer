---
id: 175
title: Prove no network request happens when updates are off
type: chore
priority: P2
effort: S
model: sonnet
area: [importers]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP40"
depends_on: [172]
created: 2026-10-25
---

Integration test with all outbound sockets blocked: activation, opening the form, importing and downloading nothing.

**Code:** `vsslicer/modules/profiles-extension/src/presentation/...` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With the setting off, a run of activation, import from installed folders and form opening makes zero outbound connection attempts (blocked-network harness counts them)
- [ ] The test fails if a new network call is added to those paths (checked by adding one in a scratch branch and recording the result)

## Tasks

- [ ] Blocked-network harness
- [ ] Scenarios

## Progress

Not started.
