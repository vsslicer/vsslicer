---
id: 118
title: "Implement the upload policy: licence expression, copyleft source link and namespace allow-list"
type: feature
priority: P2
effort: S
model: sonnet
area: [registry]
story: US61
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [110]
created: 2026-10-25
---

A pure function decides whether a package manifest may be published: valid SPDX licence expression, a repository link for copyleft licences, namespace on the allow-list (default `vsslicer` only).

**Code:** `vsslicer/modules/openvsx-registry/src/domain/upload-policy.ts` (module: `openvsx-registry`, layer: `domain`)

## Acceptance criteria

- [ ] `checkUpload(manifest, policy)` returns accept or a list of named refusals (`NoLicence`, `InvalidLicenceExpression`, `CopyleftWithoutSource`, `NamespaceNotAllowed`)
- [ ] Unit tests cover MIT, AGPL-3.0-or-later with and without `repository`, `UNLICENSED`, `SEE LICENSE IN` and an unknown namespace
- [ ] The copyleft list is data in the module, not code

## Tasks

- [ ] Write the domain function and the licence class table
- [ ] Write the unit tests

## Progress

Not started.
