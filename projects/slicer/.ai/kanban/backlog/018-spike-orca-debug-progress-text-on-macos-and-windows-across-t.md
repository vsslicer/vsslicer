---
id: 18
title: "Spike: Orca `--debug` progress text on macOS and Windows across two releases"
type: spike
priority: P1
effort: S
model: opus
area: [orca, engine]
story: US3
milestone: "VSS:M3"
depends_on: [16]
created: 2026-10-25
---

Parse the progress text only if it is stable across two pinned releases; otherwise keep indeterminate progress. Optionally note an upstream `--pipe` patch.

**Code:** `vsslicer/modules/slicer-orca/` (module: `slicer-orca`, layer: n/a (spike))

## Acceptance criteria

- [ ] Recorded debug output from the two releases on macOS and Windows (CI artefacts) is compared and the stable lines, if any, listed
- [ ] Decision: parse (with the regex list) or indeterminate on macOS and Windows

## Tasks

- [ ] Capture output on both OSes and both releases
- [ ] Diff
- [ ] Decide

## Progress

Not started.
