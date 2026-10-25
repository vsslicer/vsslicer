---
id: 120
title: Configure publishing size limits and test a platform VSIX at the limit
type: feature
priority: P2
effort: S
model: sonnet
area: [registry]
story: US61
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [113, 22]
created: 2026-10-25
---

Sets `ovsx.publishing.max-content-size` and the per-namespace override sized for platform-specific engine VSIX files.

**Code:** `vsslicer/modules/openvsx-registry/compose/` and `test/` (module: `openvsx-registry`, layer: n/a (deployment))

## Acceptance criteria

- [ ] A generated VSIX exactly at the configured limit uploads; one byte over is refused with the registry error text
- [ ] The limit and the override are in the env template with the largest per-target engine VSIX size as the stated basis
- [ ] Verified with synthetic VSIX files on a local instance

## Tasks

- [ ] Set the limits
- [ ] Write the boundary tests with generated VSIX files

## Progress

Not started.
