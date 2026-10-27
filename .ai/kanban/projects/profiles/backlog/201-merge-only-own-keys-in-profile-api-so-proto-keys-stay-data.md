---
id: 201
title: Merge only own keys in profile-api so __proto__ keys stay data
type: bug
priority: P1
effort: S
model: sonnet
milestone: "VSS:M2"
sprint: "VSS:SP15"
created: 2026-10-26
---

From PRF-126's fix round (SP10): `vsslicer/modules/common/profile-api/src/domain/inheritance/merge.ts` reads `b[k]` without checking own keys, so on a plain `{}` a `__proto__` key returns `Object.prototype` and breaks a round-trip; profiles-orca worked around it with null-prototype maps.

**Code:** `vsslicer/modules/common/profile-api/src/domain/inheritance/merge.ts` (domain)

## Acceptance criteria

- [ ] `merge` reads and writes only own keys (`Object.hasOwn`, null-prototype result), so `__proto__`, `constructor` and `toString` keys merge as data; test for each, failing on the current code
- [ ] Every other domain map in profile-api keyed by input data is checked the same way (grep `Record<string` and `{}` accumulators); findings fixed or listed
- [ ] profile-api patch release and re-lock of its dependents (rule 13)

## Progress

Not started.
