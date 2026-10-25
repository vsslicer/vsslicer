---
id: 171
title: Verify the macOS signature in CI
type: chore
priority: P3
effort: S
model: sonnet
area: [ci]
story: US68
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [170]
created: 2026-10-25
---

Runs `codesign --verify` and `spctl` on the signed app. Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing. Fallback: the job is skipped when PLT-170 skipped.

**Code:** `.github/workflows/vsslicer-build.yml` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Budget gate: Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing.
- [ ] `codesign --verify --deep --strict` and `spctl --assess` pass on the signed build
- [ ] A deliberately modified binary fails the verification (meta-test)
- [ ] Skipped with a logged reason when unsigned

## Tasks

- [ ] Add the verify job
- [ ] Add the meta-test

## Progress

Not started.
