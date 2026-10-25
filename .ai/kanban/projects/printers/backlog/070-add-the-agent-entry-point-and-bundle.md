---
id: 70
title: Add the agent entry point and bundle
type: feature
priority: P1
effort: S
model: sonnet
area: [daemon]
story: US15
milestone: "VSS:M3"
sprint: "VSS:SP12"
depends_on: [67, 64, 68, 69, 66]
created: 2026-10-25
---

The executable entry that composes server, sessions, loader and logs; bundled to one file runnable as Node.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] `node dist/agent.js` starts the agent; `ELECTRON_RUN_AS_NODE=1` with the chosen runtime from the spike also starts it
- [ ] A crash in a session handler does not exit the process (test)

## Tasks

- [ ] Composition root
- [ ] Bundle
- [ ] Smoke test

## Progress

Not started.
