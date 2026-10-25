---
id: 124
title: Surface unsupported-setting warnings through the matcher channel
type: feature
priority: P1
effort: S
model: sonnet
area: [tasks, engine]
story: US27
milestone: "VSS:M3"
depends_on: [92, 122, 111]
created: 2026-10-25
---

The pipeline calls `unsupportedKeys` for the chosen engine and prints one warning line per key in the format the matcher reads.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Slicing with two unsupported keys set gives exactly two Problems entries naming the keys (extension host test with the fake engine)
- [ ] No error entry and no silent skip
- [ ] Warnings have the profile file location when known

## Tasks

- [ ] Call the function in the pipeline
- [ ] Format the line
- [ ] Test

## Progress

Not started.
