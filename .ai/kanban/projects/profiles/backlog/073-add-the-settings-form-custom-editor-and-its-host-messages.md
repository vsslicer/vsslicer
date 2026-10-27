---
id: 73
title: Add the settings form custom editor and its host messages
type: feature
priority: P0
effort: M
model: sonnet
area: [form]
story: US30
milestone: "VSS:M3"
sprint: "VSS:SP21"
depends_on: [59, 144, PLT-30, PLT-32, PLT-34, PLT-36, 140]
created: 2026-10-25
---

The host half of the custom editor for one entity: sends the form model and values, and sends every edit to `ProfileStore.save`; the webview holds no state of record.

**Code:** `vsslicer/modules/apps/profiles/src/presentation/form/` (module: `profiles-extension`, layer: `presentation`)

## Acceptance criteria

- [ ] Opening an entity sends the model and effective values; an edit message calls `save` and the file diff is that one key (E13 edit-diff test reused end to end)
- [ ] A setting `vsslicer.profiles.form.enabled=false` leaves JSON editing as the fallback
- [ ] Disposing the editor mid-save leaves no listener

## Tasks

- [ ] Register the custom editor
- [ ] Define message types
- [ ] Handle edit and reset
- [ ] Integration test

## Progress

Not started.
