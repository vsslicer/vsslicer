---
id: 113
title: Configure the upstream registry and stable extension UUIDs
type: feature
priority: P3
effort: S
model: sonnet
area: [registry]
story: US60
depends_on: [112]
created: 2026-10-25
---

Points the instance at open-vsx.org as its upstream and configures stable UUID fetching so public extensions keep their upstream identity.

**Code:** `vsslicer/modules/tooling/openvsx-registry/compose/` and `test/` (module: `openvsx-registry`, layer: n/a (deployment))

## Acceptance criteria

- [ ] For a public extension we do not host (named in the test config), the local instance serves its metadata and VSIX through fall-through
- [ ] The upstream URL and UUID settings are in the env template with comments naming the setting from the spike
- [ ] Verified on a local instance in CI (network to open-vsx.org allowed in that job only)

## Tasks

- [ ] Add the upstream settings
- [ ] Add the fall-through integration test using the `ovsx` CLI and plain HTTP

## Progress

Not started.
