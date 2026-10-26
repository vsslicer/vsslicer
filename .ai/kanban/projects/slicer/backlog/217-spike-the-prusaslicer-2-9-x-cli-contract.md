---
id: 217
title: "Spike: the PrusaSlicer 2.9.x CLI contract"
type: spike
priority: P2
effort: M
model: opus
area: [prusa]
story: US66
milestone: "VSS:M5"
sprint: "VSS:SP41"
depends_on: [216]
created: 2026-10-25
---

Runs the pinned 2.9.x CLI headless and records what the adapter needs: argv for `--load`, `--datadir`, output naming, `binary_gcode`, thumbnails in `.bgcode`, the preset-update gate, exit codes, stderr error lines, whether post-processing scripts run before binarisation and which progress text exists.

**Code:** `vsslicer/modules/slicer-prusa/` (module: `slicer-prusa`, layer: n/a (spike))

## Acceptance criteria

- [ ] A report in `docs/research/` lists the argv that slices the fixture cube with a private `--datadir` and no prompt, with the recorded stderr of a success and of three failures (missing config, bad model, impossible setting)
- [ ] It states what exit code each failure returns and whether each leaves an output file
- [ ] It states whether `post_process` and `gcode_substitutions` apply before `.bgcode` conversion
- [ ] The pinned 2.9.x version and its download URLs and hashes for the three platforms are recorded

## Tasks

- [ ] Install 2.9.x locally
- [ ] Try success and failures
- [ ] Check the `.bgcode` and thumbnail behaviour
- [ ] Write the report

## Progress

Not started.
