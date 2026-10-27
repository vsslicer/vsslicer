---
id: 170
title: Sign and notarise the macOS build
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

Developer ID signing and `xcrun notarytool` in the build workflow. Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing. Fallback without budget: the step logs "signing skipped: no budget" and the build stays an unsigned CI artefact; the local unsigned recipe from PLT-153 is the way to run it.

**Code:** `.github/workflows/build.yml` (repo: `vsslicer/vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Budget gate: Blocked on a signing budget (D5, D10): do not start until `PLT-128` records a yes for signing.
- [ ] With credentials, the macOS app is signed and notarised and stapled; credentials only reach this job
- [ ] Without credentials, the step is skipped with the logged reason and CI stays green (test on the workflow)
- [ ] No credential appears in logs (scan)

## Tasks

- [ ] Add the signing and notarisation steps
- [ ] Add the skip path
- [ ] Add the log scan

## Progress

Not started.
