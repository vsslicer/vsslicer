---
id: 100
title: Upload to OctoPrint with select and print
type: feature
priority: P0
effort: S
model: sonnet
area: [octoprint]
story: US20
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [98]
created: 2026-10-25
---

Multipart upload to `local` with `select` and `print`, progress and abort.

**Code:** `vsslicer/modules/printer-octoprint/src/adapters/...` (module: `printer-octoprint`, layer: `adapters`)

## Acceptance criteria

- [ ] Upload, select-only and print-after-upload work in fixtures; abort closes the stream; a 409 maps to `busy`

## Tasks

- [ ] Upload
- [ ] Tests

## Progress

Not started.
