---
id: 151
title: Resolve inherited values with the source of each
type: feature
priority: P1
effort: M
model: opus
area: [editor]
story: US47
milestone: "VSS:M4"
depends_on: [149, PRF-140]
created: 2026-10-25
---

For an object, part or modifier, resolves the profile through `profiles` and reports each key's value with its source: profile entity, plate or override.

**Code:** `vsslicer/modules/project-extension/src/application/overrides/inherit.ts` (module: `project-extension`, layer: `application`)

## Acceptance criteria

- [ ] On a fixture the report names the profile entity that set a key and the override that replaced it
- [ ] Changing the profile selection changes the reported values
- [ ] The resolve call is cached per selection (no resolve per keystroke)

## Tasks

- [ ] Use of resolve provenance
- [ ] Source tagging
- [ ] Tests

## Progress

Not started.
