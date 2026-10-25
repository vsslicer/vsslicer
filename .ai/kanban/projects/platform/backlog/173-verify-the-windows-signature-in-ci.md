---
id: 173
title: Verify the Windows signature in CI
type: chore
priority: P3
effort: S
model: sonnet
area: [ci]
story: US68
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [172]
created: 2026-10-25
---

Runs `signtool verify /pa` on the signed output. Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing. Fallback: skipped when PLT-172 skipped.

**Code:** `.github/workflows/vsslicer-build.yml` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Budget gate: Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing.
- [ ] `signtool verify` passes on installer and executable
- [ ] An unsigned file fails the check (meta-test)
- [ ] Skipped with a logged reason when unsigned

## Tasks

- [ ] Add the verify job
- [ ] Add the meta-test

## Progress

Not started.
