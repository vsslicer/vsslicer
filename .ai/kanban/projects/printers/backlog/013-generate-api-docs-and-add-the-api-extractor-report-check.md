---
id: 13
title: Generate API docs and add the api-extractor report check
type: chore
priority: P0
effort: S
model: sonnet
area: [api]
story: US2
milestone: "VSS:M3"
sprint: "VSS:SP14"
depends_on: [6]
created: 2026-10-25
---

Publish API docs from TSDoc and fail CI when the public API changes without a report update.

**Code:** `vsslicer/modules/common/printer-api/` (module: `printer-api`, layer: `n/a (ci)`)

## Acceptance criteria

- [ ] API docs are generated from TSDoc into the package; every exported type has a doc comment (lint)
- [ ] An api-extractor report is committed and CI fails when it differs (regression: an unintended public change)

## Tasks

- [ ] Add api-extractor
- [ ] Wire docs generation
- [ ] CI check

## Progress

Not started.
