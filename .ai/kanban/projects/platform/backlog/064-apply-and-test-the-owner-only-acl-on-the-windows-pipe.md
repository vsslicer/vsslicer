---
id: 64
title: Apply and test the owner-only ACL on the Windows pipe
type: feature
priority: P1
effort: S
model: opus
area: [agent-protocol]
story: US41
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [50, 63]
created: 2026-10-25
---

Security-sensitive: implements the spike's chosen Windows pipe protection so only the creating user can connect. Verified on the Windows runner.

**Code:** `vsslicer/modules/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] The pipe is created with the access control the spike chose; the CI test passes on windows-latest (connect as the owner succeeds, a different principal cannot, or the documented equivalent check)
- [ ] If a pipe name is already in use by another process the server fails with a named error rather than serving on it (squatting test)

## Tasks

- [ ] Implement the pipe protection
- [ ] Write the Windows CI test

## Progress

Not started.
