---
id: 104
title: "Offer the engine download with confirmation, progress and distinct errors"
type: feature
priority: P0
effort: M
model: sonnet
area: [engine]
story: US2
milestone: "VSS:M3"
depends_on: [102, 30, 17]
created: 2026-10-25
---

The prompt that names version, size and source, a progress notification, and a distinct message per failure. On macOS it follows the spike's decision.

**Code:** `vsslicer/modules/slicer-extension/src/presentation/...` (module: `slicer-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Nothing downloads before confirmation (integration test)
- [ ] Checksum mismatch, offline and HTTP errors show distinct messages (local fixture server)
- [ ] On macOS the flow matches the recorded decision

## Tasks

- [ ] Prompt
- [ ] Progress
- [ ] Error messages
- [ ] Integration test

## Progress

Not started.
