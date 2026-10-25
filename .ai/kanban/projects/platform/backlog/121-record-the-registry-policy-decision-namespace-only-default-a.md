---
id: 121
title: "Record the registry policy decision: namespace-only default and third-party uploads"
type: docs
priority: P2
effort: XS
model: sonnet
area: [registry]
story: US61
milestone: "VSS:M6"
sprint: "VSS:SP49"
depends_on: [118]
created: 2026-10-25
---

Writes the registry policy down (roadmap question 20): the default is the `vsslicer` namespace only; the owner may change it.

**Code:** `vsslicer/modules/openvsx-registry/docs/policy.md` (module: `openvsx-registry`, layer: n/a (docs))

## Acceptance criteria

- [ ] `docs/policy.md` states the licence rules, the source-link rule for copyleft, the namespace rule and who may upload
- [ ] The decision is recorded with date and the owner answer, or the default flagged as unconfirmed
- [ ] The policy file is the one PLT-118's allow-list reads

## Tasks

- [ ] Write the policy
- [ ] Link it from the module README

## Progress

Not started.
