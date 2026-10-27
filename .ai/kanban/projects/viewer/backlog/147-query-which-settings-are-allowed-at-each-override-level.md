---
id: 147
title: Query which settings are allowed at each override level
type: feature
priority: P1
effort: M
model: sonnet
area: [editor]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [146, PRF-135]
created: 2026-10-25
---

Returns the keys allowed at plate, object, part, modifier and height-range level from the catalogue, and the reason a key is refused.

**Code:** `vsslicer/modules/apps/project/src/application/overrides/scope.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] `allowedKeys(level)` equals the catalogue scopes on a fixture catalogue
- [ ] `reasonRefused(key, level)` names the allowed levels for the key
- [ ] Unknown key gives a typed result, not an exception

## Tasks

- [ ] Query functions
- [ ] Tests

## Progress

Not started.
