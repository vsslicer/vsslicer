---
id: US30
title: "A user sees where each value comes from and edits only what they mean to"
status: reviewed
epic: VSS:E15
---

A user sees every field's effective value and its source (own, parent, override block) and can reset it to the parent.

## Acceptance criteria

- [ ] Editing a field writes only that key to the entity file (E13 edit-diff test end to end); reset to parent removes the key
- [ ] Inherited and overridden values look different and the source names the parent
- [ ] The form can be disabled by a setting, leaving JSON editing as the fallback

## Out of scope

- Editing printer connections (E16).
