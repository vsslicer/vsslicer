---
id: 160
title: Gate every update call on the opt-in setting
type: feature
priority: P2
effort: S
model: sonnet
area: [store]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP28"
depends_on: [148, 144]
created: 2026-10-25
---

`UpdateService.check` first asks the `UpdatePolicy` port; when disabled it returns `{status: 'disabled'}` without touching any `UpdateSource`.

**Code:** `vsslicer/modules/profiles/src/application/...` (module: `profiles`, layer: `application`)

## Acceptance criteria

- [ ] With the policy off, a source that throws on any call is never called (test); with it on, `check` returns the newer versions per vendor
- [ ] The default policy is off

## Tasks

- [ ] Policy port
- [ ] Service
- [ ] Tests

## Progress

Not started.
