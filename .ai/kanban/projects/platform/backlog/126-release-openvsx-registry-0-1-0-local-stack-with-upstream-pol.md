---
id: 126
title: "Release `openvsx-registry@0.1.0`: local stack with upstream, policy, signatures, backup and gallery tests"
type: chore
priority: P2
effort: XS
model: sonnet
area: [registry]
story: US64
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [116, 117, 119, 120, 123, 124, 125]
created: 2026-10-25
---

Releases the local registry stack so the build can depend on its URL settings and test fixtures.

**Code:** `vsslicer/modules/tooling/openvsx-registry/` (module: `openvsx-registry`, layer: n/a (release))

## Acceptance criteria

- [ ] Changelog, version bump to 0.1.0, `node scripts/run.mjs publish` to the local registry succeeds
- [ ] The release notes say that the hosted deployment is not included (budget-gated)

## Tasks

- [ ] Update the changelog
- [ ] Bump the version
- [ ] Publish to the local registry

## Progress

Not started.
