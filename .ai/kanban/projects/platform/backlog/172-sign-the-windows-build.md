---
id: 172
title: Sign the Windows build
type: feature
priority: P3
effort: L
model: opus
area: [fork]
story: US68
milestone: "VSS:M7"
depends_on: [128, 153]
created: 2026-10-25
---

Authenticode signing through SignPath OSS or a purchased certificate, per the budget decision. Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing. Fallback without budget: the step is skipped with a logged reason; the unsigned Windows artefact and local build recipe remain.

**Code:** `.github/workflows/build.yml` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Budget gate: Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing.
- [ ] With credentials, the installer and executables are signed; the signing service is called from this job only
- [ ] Without credentials, the step is skipped, CI stays green
- [ ] No credential appears in logs

## Tasks

- [ ] Add the signing step for the chosen service
- [ ] Add the skip path

## Progress

Not started.
