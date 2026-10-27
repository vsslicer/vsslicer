---
id: 206
title: Store the queue in a versioned JSON file
type: feature
priority: P2
effort: M
model: sonnet
area: [fleet]
story: US55
milestone: "VSS:M4"
sprint: "VSS:SP36"
depends_on: [202]
created: 2026-10-25
---

Atomic write (temp file and rename) of `.vsslicer/queue.json`, with the restart rule applied on load.

**Code:** `vsslicer/modules/printer/fleet-queue/src/adapters/...` (module: `fleet-queue`, layer: `adapters`)

## Acceptance criteria

- [ ] Persistence round trip; atomic write leaves the old file on failure (fault injection)
- [ ] A file with an unknown newer version is not overwritten

## Tasks

- [ ] Store
- [ ] Fault tests

## Progress

Not started.
