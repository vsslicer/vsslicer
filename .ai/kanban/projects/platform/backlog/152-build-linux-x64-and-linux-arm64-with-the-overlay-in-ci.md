---
id: 152
title: Build linux-x64 and linux-arm64 with the overlay in CI
type: feature
priority: P2
effort: M
model: sonnet
area: [ci]
story: US65
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [149, 150, 151]
created: 2026-10-25
---

The main workflow builds both Linux targets from the pinned tag with the overlay and patches and uploads the artefacts.

**Code:** `.github/workflows/vsslicer-build.yml` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Both Linux artefacts build in CI and the Microsoft-marks scan passes on them
- [ ] `product.json` in the output equals `buildProduct` output (diff test)
- [ ] Build time stays within the free runner limits recorded in PLT-147, or the split is documented

## Tasks

- [ ] Extend the workflow to both targets
- [ ] Add the diff test

## Progress

Not started.
