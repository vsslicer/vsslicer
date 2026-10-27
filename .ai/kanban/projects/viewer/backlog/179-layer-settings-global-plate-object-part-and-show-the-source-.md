---
id: 179
title: "Layer settings global, plate, object, part and show the source of each value"
type: feature
priority: P1
effort: M
model: opus
area: [plates]
story: US52
milestone: "VSS:M4"
sprint: "VSS:SP27"
depends_on: [151, 176, PRF-135, PRF-140]
created: 2026-10-25
---

Composes the resolved profile with a plate layer, then object and part layers, using the profile merge from `profile-api`, and tags each key with its layer. The plate layer is applied here because `resolve` takes no plate argument.

**Code:** `vsslicer/modules/apps/project/src/application/overrides/layering.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] On a fixture, a key set at plate level beats the profile and loses to an object override, and the tag says which
- [ ] Removing a plate setting returns the profile value
- [ ] Resolve is cached per selection

## Tasks

- [ ] Layer order
- [ ] Tagging
- [ ] Tests

## Progress

Not started.
