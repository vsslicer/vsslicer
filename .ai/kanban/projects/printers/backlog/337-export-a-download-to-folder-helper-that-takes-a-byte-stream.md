---
id: 337
title: Export a download-to-folder helper that takes a byte stream
type: feature
priority: P1
effort: S
model: sonnet
area: [storage]
story: US48
milestone: "VSS:M4"
sprint: "VSS:SP29"
depends_on: [162]
created: 2026-10-25
---

Reuses the large-download flow of PRN-156 for any `AsyncIterable<Uint8Array>`: folder picker, progress notification, cancel that removes the partial file.

**Code:** `vsslicer/modules/printers-extension/src/presentation/...` (module: `printers-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] A fake stream downloads to a workspace folder and to a chosen folder with progress; cancel deletes the partial file; a name clash asks before overwriting
- [ ] The helper is exported, versioned and used by `readFile` too (no second copy)

## Tasks

- [ ] Extract the helper
- [ ] Export
- [ ] Tests

## Progress

Not started.
