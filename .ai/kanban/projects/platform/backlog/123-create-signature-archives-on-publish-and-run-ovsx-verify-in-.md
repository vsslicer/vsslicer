---
id: 123
title: Create signature archives on publish and run `ovsx verify` in CI
type: feature
priority: P2
effort: S
model: sonnet
area: [registry]
story: US62
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [122, 119]
created: 2026-10-25
---

Every published version gets a signature archive; CI proves `ovsx verify` passes on it and fails on a tampered VSIX.

**Code:** `vsslicer/modules/openvsx-registry/test/signature.test.ts` (module: `openvsx-registry`, layer: n/a (tests))

## Acceptance criteria

- [ ] Each version published to the local instance has a signature archive
- [ ] `ovsx verify` passes on it in CI; a VSIX with one flipped byte fails verification
- [ ] The verify step is a reusable script the release workflow can call

## Tasks

- [ ] Enable archive creation in the publish script
- [ ] Write the verify script and the tamper test

## Progress

Not started.
