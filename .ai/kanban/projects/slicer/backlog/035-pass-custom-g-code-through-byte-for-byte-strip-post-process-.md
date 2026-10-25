---
id: 35
title: Pass custom G-code through byte for byte; strip `post_process` and engine thumbnails
type: feature
priority: P0
effort: S
model: sonnet
area: [orca, postprocess]
story: US8
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [32, 33, 34]
created: 2026-10-25
---

Start, end, layer-change and other G-code templates, and their placeholders, reach the engine unchanged. `post_process` is removed so the engine does not run scripts (the extension runs them), and engine-side thumbnails are turned off because the viewer renders them.

**Code:** `vsslicer/modules/slicer-orca/src/domain/...` (module: `slicer-orca`, layer: `domain`)

## Acceptance criteria

- [ ] Template strings are byte-identical to the imported profile's, including CRLF, tabs and non-ASCII (property test over fixture templates)
- [ ] The emitted presets contain no `post_process`; the removed list is returned for the pipeline
- [ ] Engine thumbnail keys are cleared and noted in the report

## Tasks

- [ ] Pass-through rule
- [ ] Strip rules
- [ ] Tests

## Progress

Not started.
