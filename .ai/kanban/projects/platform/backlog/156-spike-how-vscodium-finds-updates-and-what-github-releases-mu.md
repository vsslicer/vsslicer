---
id: 156
title: "Spike: how VSCodium finds updates and what GitHub releases must publish"
type: spike
priority: P2
effort: S
model: opus
area: [fork]
story: US66
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [152]
created: 2026-10-25
---

Reads the VSCodium update path (`updateUrl`, its versions repository) and decides what a GitHub-release-only update channel needs.

**Code:** `vsslicer/modules/vsslicer-build/docs/update-spike.md` (module: `vsslicer-build`, layer: n/a (spike))

## Acceptance criteria

- [ ] `docs/update-spike.md` shows the request the build makes, the response shape it expects and the files we must publish per platform
- [ ] The result says whether a separate versions repository or a release asset is the minimum, with the reason
- [ ] Linux first; macOS and Windows noted as depending on signing

## Tasks

- [ ] Read the update service code
- [ ] Observe a request from the PLT-152 build
- [ ] Write the result

## Progress

Not started.
