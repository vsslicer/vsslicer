---
id: 59
title: Host the ProfileStore in a worker and expose getStore
type: feature
priority: P0
effort: M
model: opus
area: [store]
story: US25
milestone: "VSS:M2"
sprint: "VSS:SP13"
depends_on: [57, 140]
created: 2026-10-25
---

Runs the store and index in a worker so the extension host stays responsive; a worker crash restarts it with an error message; exposes `vsslicer.profiles` API `getStore()`.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/host/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] With a 14 420-file vendor tree indexed, an extension-host heartbeat test sees no stall above 200 ms
- [ ] Killing the worker restarts it, shows an error message once, and the next `getStore().get` works
- [ ] `getStore()` returns the proxy typed as `ProfileStore`

## Tasks

- [ ] Write the worker proxy
- [ ] Restart on crash
- [ ] Export the API
- [ ] Integration tests

## Progress

Not started.
