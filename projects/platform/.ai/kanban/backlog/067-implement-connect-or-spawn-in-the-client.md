---
id: 67
title: Implement connect-or-spawn in the client
type: feature
priority: P0
effort: M
model: sonnet
area: [agent-protocol]
story: US46
milestone: "VSS:M3"
depends_on: [60, 63, 65, 66]
created: 2026-10-25
---

`AgentClient.connectOrSpawn({ executablePath, args })`: connects if a daemon answers, otherwise spawns the supplied executable detached and waits for readiness. The client never spawns unless this is called.

**Code:** `vsslicer/modules/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] With no daemon, the client spawns the given executable, waits for readiness (timeout gives a named error) and connects
- [ ] With a daemon running, nothing is spawned (spawn counter test)
- [ ] A spawned process that exits before readiness yields an error containing its exit code and last stderr lines

## Tasks

- [ ] Implement the spawn and readiness wait
- [ ] Tests with the reference server executable

## Progress

Not started.
