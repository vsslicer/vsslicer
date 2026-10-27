---
id: 129
title: Attach each extension VSIX to its GitHub Release and notify the marketplace
type: feature
priority: P1
effort: M
model: sonnet
area: [registry]
story: US72
milestone: "VSS:M6"
depends_on: [25, 126]
created: 2026-10-25
---

The publish target for the static marketplace (D24): the VSSlicer release workflow (PLT-25) attaches the VSIX to the `<name>@x.y.z` GitHub Release and sends a `repository_dispatch` to `vsslicer/vsslicer-marketplace`, which regenerates `index.json`.

**Code:** `.github/workflows/release.yml` (this repo, the release job from PLT-25) (module: n/a, layer: n/a (ci))

## Acceptance criteria

- [ ] A release attaches `<name>-<version>.vsix` and its `.sha256` to the GitHub Release
- [ ] The dispatch reaches the marketplace repo; within one Pages run the new version is in `index.json`
- [ ] A failed dispatch fails the release job by name

## Tasks

- [ ] Attach step
- [ ] Dispatch step

## Progress

Not started.
