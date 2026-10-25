---
id: 175
title: Release signed macOS and Windows installers
type: feature
priority: P3
effort: S
model: sonnet
area: [publishing]
story: US68
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [171, 173, 174, 167]
created: 2026-10-25
---

Attaches signed installers to the GitHub release. Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing. Fallback: the release carries Linux only (D10).

**Code:** `.github/workflows/vsslicer-build.yml` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Budget gate: Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing.
- [ ] A test tag attaches signed macOS and Windows installers with sha256 sums
- [ ] Unsigned installers are never attached (guard test)
- [ ] Download page text says which platforms are signed

## Tasks

- [ ] Extend the release job
- [ ] Add the guard test

## Progress

Not started.
