---
id: 117
title: "Gallery test: VSCodium pointed at the registry searches, installs, updates and falls through"
type: chore
priority: P2
effort: M
model: sonnet
area: [registry]
story: US60
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [113, 114, 115, 14, 21, 16]
created: 2026-10-25
---

Drives a stock VSCodium with `VSCODE_GALLERY_*` variables against the local registry, using the sample extension as the hosted extension.

**Code:** `vsslicer/modules/tooling/openvsx-registry/test/gallery/` (module: `openvsx-registry`, layer: n/a (tests))

## Acceptance criteria

- [ ] Search finds a `vsslicer` extension; install works; publishing a newer version of the sample extension makes it offered as an update; a public extension installs through fall-through
- [ ] The test runs in the integration matrix harness (PLT-16) on Linux; macOS and Windows are skipped with a logged reason
- [ ] Failure messages name the step (search, install, update, fall-through)

## Tasks

- [ ] Write the test on the existing VSCodium harness
- [ ] Publish two sample versions to the local instance
- [ ] Wire into CI

## Progress

Not started.
