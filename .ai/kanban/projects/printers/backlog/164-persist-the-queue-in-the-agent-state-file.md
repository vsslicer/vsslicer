---
id: 164
title: Persist the queue in the agent state file
type: feature
priority: P1
effort: M
model: sonnet
area: [daemon]
story: US32
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [163]
created: 2026-10-25
---

Atomic state-file persistence and restart rules.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] Persistence round trip; a restart while `uploading` gives `failed` with 'interrupted' (or a resume where the adapter supports it)
- [ ] An item whose source file vanished fails with the path named
- [ ] State file holds no secrets (grep test)

## Tasks

- [ ] Store
- [ ] Restart rules
- [ ] Tests

## Progress

Not started.
