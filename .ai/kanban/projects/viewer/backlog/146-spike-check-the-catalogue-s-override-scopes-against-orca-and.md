---
id: 146
title: "Spike: check the catalogue's override scopes against Orca and Prusa's object and part pages"
type: spike
priority: P1
effort: S
model: opus
area: [editor]
story: US47
milestone: "VSS:M4"
sprint: "VSS:SP26"
depends_on: [PRF-135]
created: 2026-10-25
---

Compares the `override_scope` of the profile catalogue with the keys Orca offers per object, part and range (TabPrintPart, TabPrintModel) and Prusa's `overrides_in`, and lists gaps for the profile owners.

**Code:** `vsslicer/modules/apps/project/docs/override-scope-spike.md` (module: `project-extension`, layer: n/a (spike notes))

## Acceptance criteria

- [ ] A table lists every key the Orca object, part and range pages offer with its catalogue scope
- [ ] Gaps are listed with the key and the proposed scope; none is silently ignored
- [ ] The result states whether the editor can ship with the catalogue as is

## Tasks

- [ ] Read the catalogue
- [ ] Read the Orca pages
- [ ] Compare and record

## Progress

Not started.
