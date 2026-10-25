---
id: 184
title: Append history events to monthly JSONL files
type: feature
priority: P1
effort: M
model: sonnet
area: [history]
story: US54
milestone: "VSS:M4"
sprint: "VSS:SP30"
depends_on: [182]
created: 2026-10-25
---

Writes one whole line per event to `.vsslicer/history/YYYY-MM.jsonl` with fsync; never rewrites in place; reads skip damaged lines.

**Code:** `vsslicer/modules/job-history/src/adapters/...` (module: `job-history`, layer: `adapters`)

## Acceptance criteria

- [ ] Append and monthly rollover tests (fake clock); each event is a single write ending in a newline
- [ ] A corrupt or half-written line is skipped with a warning and the file is never truncated or rewritten (test)
- [ ] Directory is created on first append

## Tasks

- [ ] Appender
- [ ] Reader with warnings
- [ ] Tests

## Progress

Not started.
