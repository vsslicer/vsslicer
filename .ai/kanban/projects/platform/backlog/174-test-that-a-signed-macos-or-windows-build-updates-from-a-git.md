---
id: 174
title: Test that a signed macOS or Windows build updates from a GitHub release
type: chore
priority: P3
effort: M
model: sonnet
area: [ci]
story: US68
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [171, 173, 164]
created: 2026-10-25
---

Extends the update smoke test to the signed platforms. Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing. Fallback: Linux update test (PLT-164) is the only update test.

**Code:** `vsslicer/modules/tooling/vsslicer-build/test/smoke/` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Budget gate: Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing.
- [ ] The older signed build is offered and installs the newer one on macOS and Windows runners
- [ ] The manifest includes the signed platforms only when verification passed
- [ ] Skipped with a logged reason when unsigned

## Tasks

- [ ] Add the signed targets to the update smoke test

## Progress

Not started.
