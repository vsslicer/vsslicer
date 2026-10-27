---
id: 279
title: Add the timelapse provider contract to the kit
type: feature
priority: P2
effort: M
model: sonnet
area: [camera]
story: US46
milestone: "VSS:M4"
sprint: "VSS:SP37"
depends_on: [278, 243]
created: 2026-10-25
---

A contract for timelapse providers plus a fake provider and a file server with a slow download for cancel tests.

**Code:** `vsslicer/modules/common/camera-api/` (module: `camera-api`, layer: `n/a (test kit)`)

## Acceptance criteria

- [ ] Checks: list, download with monotonic progress, cancel leaves no partial file, render request where declared
- [ ] The kit fails a provider that ignores `AbortSignal` (meta test)

## Tasks

- [ ] Write the contract checks
- [ ] Write the fake provider and slow server

## Progress

Not started.
