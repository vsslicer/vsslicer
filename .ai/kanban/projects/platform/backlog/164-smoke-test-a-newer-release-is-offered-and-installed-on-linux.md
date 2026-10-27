---
id: 164
title: "Smoke test: a newer release is offered and installed on Linux"
type: chore
priority: P2
effort: M
model: sonnet
area: [ci]
story: US66
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [157, 160]
created: 2026-10-25
---

Serves two builds' manifests from a local server, starts the older and checks the update is offered and applied.

**Code:** `vsslicer/modules/tooling/vsslicer-build/test/smoke/` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] The older build offers the update and restarts into the newer version
- [ ] A manifest with a wrong sha256 is refused and the build keeps running
- [ ] Linux only until signed assets exist

## Tasks

- [ ] Serve the manifests locally
- [ ] Write the update assertions

## Progress

Not started.
