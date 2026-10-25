---
id: 116
title: "Serialise, compact and cap the command log with a version"
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US37
milestone: "VSS:M4"
depends_on: [115, 103]
created: 2026-10-25
---

The compact log format with a schema version, the compaction rules from the spike, a cap, and replay onto a freshly loaded model.

**Code:** `vsslicer/modules/project-extension/src/application/commandLog.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] Replay of the log onto the saved file gives a model equal to the live one (property test)
- [ ] A log of 10,000 commands compacts under the recorded time budget
- [ ] A log with an unknown version returns a typed error
- [ ] Commands that cannot be compacted are kept

## Tasks

- [ ] Format
- [ ] Compaction
- [ ] Replay
- [ ] Tests

## Progress

Not started.
