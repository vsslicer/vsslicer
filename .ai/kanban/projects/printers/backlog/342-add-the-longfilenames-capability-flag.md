---
id: 342
title: Add the `longFilenames` capability flag
type: feature
priority: P2
effort: S
model: sonnet
area: [api]
story: US63
milestone: "VSS:M5"
sprint: "VSS:SP42"
depends_on: [320]
created: 2026-10-25
---

Adds an optional `longFilenames` capability that a connector sets when the printer's file system accepts names longer than 8.3, so storage export can read it. Additive: a minor version.

**Code:** `vsslicer/modules/printer-api/src/domain/...` (module: `printer-api`, layer: `domain`)

## Acceptance criteria

- [ ] `longFilenames` is a documented capability flag; the `can(caps, flag)` helper handles it and absent means false (unit tests)
- [ ] The api-extractor report is updated and the change is additive (the semver check passes as a minor)
- [ ] The fake adapter can set it and the contract kit does not require it

## Tasks

- [ ] Add the flag and its doc comment
- [ ] Update the fake adapter
- [ ] Update tests and the API report

## Progress

Not started.
