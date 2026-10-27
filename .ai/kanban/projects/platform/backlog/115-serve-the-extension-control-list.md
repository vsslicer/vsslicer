---
id: 115
title: Serve the extension-control list
type: feature
priority: P2
effort: S
model: sonnet
area: [registry]
story: US60
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [112]
created: 2026-10-25
---

Configures the extension-control list that `controlUrl` in the build points at, starting empty.

**Code:** `vsslicer/modules/tooling/openvsx-registry/compose/` (module: `openvsx-registry`, layer: n/a (deployment))

## Acceptance criteria

- [ ] The control list is served at a stable URL on the local instance with the documented JSON shape
- [ ] A test adds a malicious-extension entry and the served list changes
- [ ] The shape is the one the spike recorded from `doc/configuration.md`

## Tasks

- [ ] Configure the control list file and URL
- [ ] Add the test

## Progress

Not started.
