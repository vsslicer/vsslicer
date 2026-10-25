---
id: 269
title: Start go2rtc bound to 127.0.0.1 with api.local_auth and stop it with the agent
type: feature
priority: P1
effort: M
model: opus
area: [camera, daemon]
story: US44
milestone: "VSS:M4"
sprint: "VSS:SP21"
depends_on: [268]
created: 2026-10-25
---

Run the sidecar with generated config: API and RTSP bound to 127.0.0.1, `api.local_auth`, random port, credentials in memory only; it exits with the agent.

**Code:** `vsslicer/modules/printer-agent/src/adapters/...` (module: `printer-agent`, layer: `adapters`)

## Acceptance criteria

- [ ] The process listens on 127.0.0.1 only (bound-address test) and rejects requests without the generated credentials
- [ ] Agent shutdown and agent crash leave no go2rtc process (kill test)
- [ ] Config is written to the agent state dir and contains no printer access code on disk beyond the RTSP URL held in memory

## Tasks

- [ ] Generate the config
- [ ] Spawn, ready-check and stop
- [ ] Write the lifetime tests

## Progress

Not started.
