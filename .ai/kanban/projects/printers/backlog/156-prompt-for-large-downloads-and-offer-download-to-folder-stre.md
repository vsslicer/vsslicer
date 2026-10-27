---
id: 156
title: Prompt for large downloads and offer download-to-folder streaming
type: feature
priority: P1
effort: S
model: sonnet
area: [storage]
story: US29
milestone: "VSS:M3"
sprint: "VSS:SP23"
depends_on: [154]
created: 2026-10-25
---

Handle files above the in-memory limit.

**Code:** `vsslicer/modules/apps/printers/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Above the limit `readFile` asks first; 'download to folder' streams to disk with progress and cancel (test with a large fake file)

## Tasks

- [ ] Prompt
- [ ] Streaming download

## Progress

Not started.
