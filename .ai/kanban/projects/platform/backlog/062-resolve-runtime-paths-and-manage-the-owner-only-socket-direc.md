---
id: 62
title: Resolve runtime paths and manage the owner-only socket directory and token file
type: feature
priority: P0
effort: M
model: opus
area: [agent-protocol]
story: US41
milestone: "VSS:M3"
sprint: "VSS:SP15"
depends_on: [49, 50]
created: 2026-10-25
---

Security-sensitive: finds the per-user runtime directory (XDG_RUNTIME_DIR, macOS per-user temp, Windows pipe name from the spike), creates it 0700, writes the random token 0600 next to the socket, and rotates it on server start.

**Code:** `vsslicer/modules/common/agent-protocol/src/adapters/...` (module: `agent-protocol`, layer: `adapters`)

## Acceptance criteria

- [ ] On Linux and macOS a test asserts directory mode 0700, token file 0600, and refuses to use a directory owned by another user or more permissive than 0700
- [ ] Token is 32 random bytes from `crypto`, replaced atomically (write temp, rename) at every start; the client reads it fresh on each connect
- [ ] Over-long socket paths fall back as decided in the spike, with a named error if none works

## Tasks

- [ ] Implement path resolution per OS
- [ ] Implement token create/rotate/read with mode checks
- [ ] Tests on the three CI operating systems

## Progress

Not started.
