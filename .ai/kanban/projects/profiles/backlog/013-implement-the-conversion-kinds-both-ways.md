---
id: 13
title: Implement the conversion kinds both ways
type: feature
priority: P0
effort: S
model: sonnet
area: [schema]
story: US9
milestone: "VSS:M2"
sprint: "VSS:SP7"
depends_on: [12]
created: 2026-10-25
---

Pure functions that convert one value between a native dialect and the unified form: scale, sign flip, percent-of, enum map, 90-x.

**Code:** `vsslicer/modules/profile-api/src/domain/catalogue/conversion/` (module: `profile-api`, layer: `domain`)

## Acceptance criteria

- [ ] Each conversion kind round-trips a table of values (`native -> unified -> native` equals the input)
- [ ] A lossy conversion returns a `lossy` flag with the reason; a `%` value stays relative (`50%` is not turned into a number)
- [ ] An unknown enum value returns a diagnostic, not a guess

## Tasks

- [ ] Write the conversion functions
- [ ] Write the round-trip tests

## Progress

Not started.
