---
id: 86
title: Expose getConnection(instanceId) in the extension API
type: feature
priority: P0
effort: M
model: opus
area: [store]
story: US35
milestone: "VSS:M3"
sprint: "VSS:SP22"
depends_on: [85, 59]
created: 2026-10-25
---

Returns host type, url and credential to the calling extension, and only for instances whose `host_type` the caller names; missing credential gives `credential-missing` with a re-enter action.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/api/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] `getConnection(id, {hostType})` returns the credential only when `hostType` equals the instance's; a mismatch throws a named error (test)
- [ ] A cleared keychain gives `credential-missing`, and the 'Re-enter credential' command stores a new secret
- [ ] Documented in the README: any installed extension can call it (VS Code's trust model)

## Tasks

- [ ] Write the API method
- [ ] Host-type match rule
- [ ] Re-enter command
- [ ] Integration tests

## Progress

Not started.
