---
id: 163
title: "Smoke test: gallery search, install and fall-through with no Microsoft Marketplace traffic"
type: chore
priority: P2
effort: M
model: sonnet
area: [ci]
story: US66
milestone: "VSS:M6"
sprint: "VSS:SP50"
depends_on: [155, 160, 126]
created: 2026-10-25
---

In the build with the local registry as gallery, searches and installs our extension and a public one, and checks a proxy log.

**Code:** `vsslicer/modules/vsslicer-build/test/smoke/` (module: `vsslicer-build`, layer: n/a (ci))

## Acceptance criteria

- [ ] Search and install of a `vsslicer` extension from the local registry works; a public extension installs through fall-through
- [ ] A proxy log of the run contains no request to the Microsoft Marketplace hosts; any such request fails the test and prints it
- [ ] Local registry only; the hosted one is covered by the registry module when it exists

## Tasks

- [ ] Run the build behind a logging proxy
- [ ] Write the install steps and the log check

## Progress

Not started.
