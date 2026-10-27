---
id: 66
title: Request secrets from the window and keep them in memory only
type: feature
priority: P1
effort: S
model: opus
area: [daemon]
story: US18
milestone: "VSS:M3"
sprint: "VSS:SP19"
depends_on: [65]
created: 2026-10-25
---

The agent asks the window that opened the session for the secret, holds it in memory and never writes it.

**Code:** `vsslicer/modules/printer/agent/src/application/...` (module: `printer-agent`, layer: `application`)

## Acceptance criteria

- [ ] A session open triggers a secret request; denial gives `PrinterError.auth`
- [ ] Test greps the agent state file, logs and crash dump path for the secret: zero hits

## Tasks

- [ ] Request flow
- [ ] Memory-only holder
- [ ] Leak test

## Progress

Not started.
