---
id: 61
title: Expose `resolveCuraStack` and list unsupported functions per profile
type: feature
priority: P1
effort: M
model: sonnet
area: [cura]
story: US13
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [60]
created: 2026-10-25
---

The public use cases: `resolveCuraStack(stack): ResolvedCuraSettings` and `listUnsupported(stack)` for import time, so gaps show before slicing.

**Code:** `vsslicer/modules/cura-settings/src/application/...` (module: `cura-settings`, layer: `application`)

## Acceptance criteria

- [ ] `resolveCuraStack` returns every key with its source container
- [ ] An unsupported function fails resolution with the key and the function named, never a silent default
- [ ] `listUnsupported` returns all gaps of a profile in one call

## Tasks

- [ ] Use cases
- [ ] Error reporting
- [ ] Docs for PRF

## Progress

Not started.
