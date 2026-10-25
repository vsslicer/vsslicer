---
id: 112
title: Record the environment the pinned Orca gives a post-processing script
type: chore
priority: P1
effort: S
model: sonnet
area: [postprocess]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [30, 1]
created: 2026-10-25
---

A fixture script that dumps its argv and environment, run by the pinned Orca through a preset with `post_process`, and the recording committed as the oracle.

**Code:** `vsslicer/modules/slicer-extension/` (module: `slicer-extension`, layer: n/a (fixtures))

## Acceptance criteria

- [ ] `recorded-env.json` holds argv and all `SLIC3R_*` variables for the fixture plate, with Orca version
- [ ] The dump script is portable (Node), so it runs the same on all runners
- [ ] Provenance recorded

## Tasks

- [ ] Dump script
- [ ] Run with Orca
- [ ] Commit recording

## Progress

Not started.
