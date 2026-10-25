---
id: 16
title: "Spike: run the pinned Orca headless on Linux CI and pick the pinned releases"
type: spike
priority: P0
effort: S
model: opus
area: [orca, engine]
story: US7
milestone: "VSS:M3"
depends_on: [15, 1, PLT-9]
created: 2026-10-25
---

Settles how Orca runs on a headless free GitHub Actions Linux runner (AppImage extraction without FUSE, whether `xvfb-run` is needed, the CLI exiting 1 without a display) and which release to pin: it must carry an H2C machine profile, else the adapter targets the Bambu Studio CLI as a configured variant.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (spike))

## Acceptance criteria

- [ ] A note in `.reference/notes/` and a short `docs/` page record: working command line on the runner, display needs, pinned release (and the previous one for the progress spike) with URLs and SHA-256
- [ ] The pinned release is confirmed to contain an H2C machine profile, or the Bambu Studio CLI variant is chosen and recorded
- [ ] A throwaway CI job slices the fixture cube with the chosen setup

## Tasks

- [ ] Try AppImage extract and run on a runner
- [ ] Check profile list for H2C
- [ ] Record the decision

## Progress

Not started.
