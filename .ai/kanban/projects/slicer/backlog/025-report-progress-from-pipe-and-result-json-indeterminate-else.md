---
id: 25
title: "Report progress from `--pipe` and `result.json`, indeterminate elsewhere"
type: feature
priority: P0
effort: M
model: sonnet
area: [orca, engine]
story: US3
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [24, 18]
created: 2026-10-25
---

On Linux the JSON progress from `--pipe` is read and `result.json` is parsed after the run; macOS and Windows report indeterminate progress, or parsed debug text only if the spike called it stable.

**Code:** `vsslicer/modules/slicer/orca/src/adapters/...` (module: `slicer-orca`, layer: `adapters`)

## Acceptance criteria

- [ ] Recorded `--pipe` output drives progress to 100 in a unit test; a malformed line is skipped with a warning
- [ ] `result.json` content (errors, warnings) becomes `Warning` or `EngineError` events
- [ ] On macOS and Windows the stream reports indeterminate progress

## Tasks

- [ ] Pipe reader
- [ ] result.json reader
- [ ] Fallback
- [ ] Tests with recordings

## Progress

Not started.
