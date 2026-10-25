---
id: 119
title: Enforce the upload policy on a local instance and in the publish gate
type: feature
priority: P2
effort: M
model: sonnet
area: [registry]
story: US61
milestone: "VSS:M6"
sprint: "VSS:SP35"
depends_on: [118, 113]
created: 2026-10-25
---

Applies the policy twice: the server setting that requires a licence, and a pre-publish gate script the release job calls so refusals are named in the job log.

**Code:** `vsslicer/modules/openvsx-registry/src/adapters/publish-gate.ts` (module: `openvsx-registry`, layer: `adapters`)

## Acceptance criteria

- [ ] Against a local instance, an upload without a licence expression is refused and a copyleft upload without a repository link is refused (CI tests)
- [ ] The gate script prints each refusal by name and exits non-zero; the release job shows the registry error text
- [ ] An accepted upload still works (regression test)

## Tasks

- [ ] Set the server licence requirement
- [ ] Write the gate CLI using `checkUpload`
- [ ] Add the CI tests

## Progress

Not started.
