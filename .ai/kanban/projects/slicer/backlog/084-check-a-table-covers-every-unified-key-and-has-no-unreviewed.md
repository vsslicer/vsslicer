---
id: 84
title: Check a table covers every unified key and has no unreviewed entries
type: feature
priority: P0
effort: S
model: sonnet
area: [engine]
story: US26
milestone: "VSS:M3"
sprint: "VSS:SP20"
depends_on: [83, PRF-135]
created: 2026-10-25
---

Pure check given the table and a list of unified keys (the list comes from PRF's catalogue in the adapters' tests).

**Code:** `vsslicer/modules/slicer-api/src/application/...` (module: `slicer-api`, layer: `application`)

## Acceptance criteria

- [ ] A missing key fails with the key named; an extra key (not in the catalogue) fails
- [ ] An entry marked unreviewed fails the check
- [ ] A skeleton generator writes `unsupported` unreviewed entries for new keys (regression: PRF adds keys)

## Tasks

- [ ] Check function
- [ ] Skeleton generator
- [ ] Tests

## Progress

Not started.
